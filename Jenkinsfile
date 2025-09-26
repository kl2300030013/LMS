pipeline {
  agent any

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    COMPOSE_DIR = 'C:\\Users\\deera\\OneDrive\\Documents\\Spring\\project\\docker'
  }

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Node deps (frontend)') {
      steps {
        dir('.') {
          script {
            if (isUnix()) {
              sh 'npm ci || npm install'
            } else {
              powershell 'npm ci; if ($LASTEXITCODE -ne 0) { npm install }'
            }
          }
        }
      }
    }

    stage('Build frontend') {
      steps {
        dir('.') {
          script {
            if (isUnix()) {
              sh 'npm run build || npx vite build'
            } else {
              powershell 'npm run build; if ($LASTEXITCODE -ne 0) { npx vite build }'
            }
          }
        }
      }
    }

    stage('Build Docker images') {
      steps {
        script {
          if (isUnix()) {
            sh 'docker version'
            sh 'docker compose version'
            sh "cd \"${COMPOSE_DIR}\" && docker compose build --no-cache"
          } else {
            powershell 'docker version'
            powershell 'docker compose version'
            powershell "Push-Location \"$env:COMPOSE_DIR\"; docker compose build --no-cache; Pop-Location"
          }
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        script {
          if (isUnix()) {
            sh "cd \"${COMPOSE_DIR}\" && docker compose up -d"
          } else {
            powershell "Push-Location \"$env:COMPOSE_DIR\"; docker compose up -d; Pop-Location"
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'docker-compose.yml', onlyIfSuccessful: false
    }
  }
}
