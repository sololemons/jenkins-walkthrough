pipeline {
    agent {
        docker {
            image 'node:22.14.0'
        }
    }
    
    environment {
        NEXUS_CREDENTIALS_ID = 'nexus-creds' 
        NEXUS_URL = "http://nexus:8081/repository/week5-ip-nexus-repository/"

        GIT_SHA              = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        APP_VERSION          = "1.0.0-${GIT_SHA}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out from ${GIT_BRANCH} at commit ${GIT_SHA}"
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
                echo "Code linting passed"
            }
        }
        
        stage('Verify') {
            parallel {
                stage('Test') {
                    steps {
                        sh 'npm test'
                        echo "Unit tests passed"
                    }
                }
                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level=high'
                        echo "Security audit passed"
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm version ${APP_VERSION} --no-git-tag-version'
                sh 'npm run build'
                
                sh 'npm pack'
                echo "Production build and tarball created"
            }
        }
        
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: '*.tgz', fingerprint: true
                echo "Artifacts archived and fingerprinted"
            }
        }
        
        stage('Publish to Nexus') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS_ID, passwordVariable: 'NEXUS_PASS', usernameVariable: 'NEXUS_USER')]) {
                    sh '''
                        echo "Setting up temporary .npmrc..."
                        echo "registry=${NEXUS_URL}" > .npmrc
                        
                        AUTH=$(echo -n "${NEXUS_USER}:${NEXUS_PASS}" | base64)
                        echo "//${NEXUS_URL#*://}:_auth=${AUTH}" >> .npmrc
                        
                        echo "Publishing version ${APP_VERSION} to Nexus..."
                        npm publish *.tgz
                        
                        echo "Cleaning up credentials..."
                        rm -f .npmrc
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo """
            ========================================
            DEPLOYMENT SUCCESSFUL!
            ========================================
            Versioned artifact published: ${APP_VERSION}
            Registry URL: ${NEXUS_URL}your-package-name/-/${APP_VERSION}.tgz
            ========================================
            """
        }
        failure {
            echo "PIPELINE FAILURE: The broken-build contract has been triggered. Please review the logs above to identify the fault."
        }
        changed {
            echo "STATUS TRANSITION: The pipeline status has changed since the last run (e.g., from failing to successful, or vice versa)."
        }
    }
}