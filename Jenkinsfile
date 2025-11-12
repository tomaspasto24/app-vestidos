pipeline {
  agent {
    docker {
      image 'node:18-alpine'
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

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
        sh """
          if [ \$(docker ps -a -q -f name=${DOCKER_IMAGE}) ]; then
            docker rm -f ${DOCKER_IMAGE}
          fi
        """
        sh "docker run -d -p 3000:3000 --name ${DOCKER_IMAGE} ${DOCKER_IMAGE}:${DOCKER_TAG}"
      }
    }
  }
}
