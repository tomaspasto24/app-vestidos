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
        sh 'npm install'
      }
    }

    stage("Build Next.js") {
      steps {
        sh 'npm run build'
      }
    }

    stage("Build Docker Image") {
      steps {
        sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
      }
    }

    stage("Run Docker Container") {
      steps {
        // Stop and remove existing container if it exists
        sh """
          if [ \$(docker ps -a -q -f name=${DOCKER_IMAGE}) ]; then
            docker rm -f ${DOCKER_IMAGE}
          fi
        """
        // Run the container locally
        sh "docker run -d -p 3000:3000 --name ${DOCKER_IMAGE} ${DOCKER_IMAGE}:${DOCKER_TAG}"
      }
    }

  }

  post {
    always {
      echo "Pipeline finished."
    }
    success {
      echo "✅ App is running locally at http://localhost:3000"
    }
    failure {
      echo "❌ Pipeline failed!"
    }
  }
}
