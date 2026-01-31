pipeline {
    agent any

    tools {
        nodejs "NodeJS" 
    }

    environment {
        DOCKER_IMAGE = "ghcr.io/jandersonsiqueira-github/api-livros"
        
        TAG_VERSION = "v1.0.${BUILD_NUMBER}"
        
        SCANNER_HOME = tool 'SonarScanner' 
    }

    stages {
        stage('1. Build & Install') {
            steps {
                echo '--- Instalando Dependências ---'
                sh 'npm install'
            }
        }

        stage('2. Unit Tests') {
            steps {
                echo '--- Rodando Testes Unitários ---'
                sh 'npm run test:ci'
            }
        }

        stage('3. SonarQube Analysis') {
            steps {
                echo '--- Iniciando Análise do Sonar ---'
                withSonarQubeEnv('SonarQube') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=api-livros \
                    -Dsonar.sources=src \
                    -Dsonar.tests=tests \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.report.info
                    """
                }
            }
        }

        stage('4. Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('5. Trivy Repo Scan') {
            steps {
                echo '--- Security Scan (Filesystem) ---'
                sh 'trivy fs --exit-code 1 --severity HIGH,CRITICAL .'
            }
        }

        stage('6. Docker Build') {
            steps {
                echo '--- Construindo Imagem Docker ---'
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${TAG_VERSION}")
                }
            }
        }

        stage('7. Trivy Image Scan') {
            steps {
                echo '--- Security Scan (Imagem Docker) ---'
                sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${TAG_VERSION}"
            }
        }

        stage('8. Push & Git Tag') {
            when { branch 'main' }
            steps {
                script {
                    echo '--- Publicando Imagem no GitHub Packages ---'
                    
                    docker.withRegistry('https://ghcr.io', 'git-credentials') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}