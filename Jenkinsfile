pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "app-vestidos"
        DOCKER_TAG = "latest"
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Install Dependencies") {
            steps {
                echo "Installing npm dependencies..."
                sh 'npm install'
            }
        }

        stage("Build Next.js") {
            steps {
                echo "Building Next.js app..."
                sh 'npm run build'
            }
        }

        stage("Run E2E Tests") {
            steps {
                echo "Installing Playwright browsers..."
                sh "npx playwright install --with-deps"
                
                echo "Running E2E tests..."
                sh "npm run test:e2e"
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        success {
            echo "Build and deployment succeeded."
        }
        failure {
            echo "Build or deployment failed."
        }
    }
}
