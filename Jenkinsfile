pipeline {
    agent {
        docker {
            image 'node:22.14.0'
            args '--network cicd-net'
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        NEXUS_CREDENTIALS_ID = 'nexus-creds'
        NEXUS_URL = "http://nexus:8081/repository/week5-ip-nexus-repository/"
        PUBLIC_NEXUS_URL = "http://localhost:8081/repository/week5-ip-nexus-repository/" 
        PACKAGE_NAME = "kijanikiosk-api"  
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.APP_VERSION = "1.0.0-${env.GIT_SHA}"
                }
                echo "Checked out commit ${GIT_SHA}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                echo "Dependencies installed"
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
                echo "Lint passed"
            }
        }

        stage('Build') {
            steps {
                sh """
                    npm version ${APP_VERSION} --no-git-tag-version
                    npm run build
                    npm pack
                """
                echo "Build and packaging complete"
            }
        }

        stage('Verify') {
            parallel {

                stage('Test') {
                    steps {
                        sh 'npm test -- --reporter=junit --outputFile=junit.xml'
                        echo "Tests passed"
                    }
                }

                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level=high || true'
                        echo "Security audit completed"
                    }
                }
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: '*.tgz', fingerprint: true
                echo "Artifacts archived"
            }
        }

        stage('Publish to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.NEXUS_CREDENTIALS_ID,
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                        echo "Setting up temporary .npmrc..."

                        echo "registry=${NEXUS_URL}" > .npmrc

                        REGISTRY_HOST=$(echo $NEXUS_URL | sed 's|^http[s]*://||')
                        AUTH=$(echo -n "${NEXUS_USER}:${NEXUS_PASS}" | base64)

                        echo "//${REGISTRY_HOST}:_auth=${AUTH}" >> .npmrc

                        echo "Publishing ${APP_VERSION}..."
                        npm publish *.tgz

                        echo "Cleaning credentials..."
                        rm -f .npmrc
                    '''
                }
            }
        }
    }

    post {

        always {
            echo "Running cleanup and publishing test results..."

            junit '**/junit.xml'

            cleanWs()
        }

        success {
            echo """
========================================
DEPLOYMENT SUCCESSFUL
========================================
Version: ${APP_VERSION}
Artifact URL:
${PUBLIC_NEXUS_URL}${PACKAGE_NAME}/-/${PACKAGE_NAME}-${APP_VERSION}.tgz
========================================
"""
        }

        failure {
            echo "PIPELINE FAILURE: Check logs to identify the issue."
        }

        changed {
            echo "STATUS CHANGE: Pipeline result differs from previous run."
        }
    }
}