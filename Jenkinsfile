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
                sh 'npm run dev'
            }
        }

        stage("Build Docker Image") {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

        stage("Run Docker Container") {
            steps {
                echo "Stopping previous container if exists..."
                sh """
                    if [ \$(docker ps -a -q -f name=${DOCKER_IMAGE}) ]; then
                        docker rm -f ${DOCKER_IMAGE}
                    fi
                """

                echo "Running Docker container..."
                sh "docker run -d -p 3000:3000 --name ${DOCKER_IMAGE} ${DOCKER_IMAGE}:${DOCKER_TAG}"
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
