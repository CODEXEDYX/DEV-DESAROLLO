pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  name: socat-pod
  namespace: jenkins-download
spec:
  containers:
  - name: socat
    image: alpine/socat
    command:
    - sh
    - -c
    - "socat -d -d TCP-L:2375,fork,reuseaddr UNIX:/var/run/docker.sock"
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: trivy
    image: aquasec/trivy:latest
    command:
    - sleep
    args:
    - infinity
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }

    environment {
        APP_VERSION = '0.0.1' // la version
        DOCKER_REPO_BACKEND = 'codexedyx/jenkins-backend' // el  nombre de las imagenes
        DOCKER_REPO_FRONTEND = 'codexedyx/jenkins-frontend' // el nombre de la imagenes
        ARGOCD_SERVER = 'argocd.local' // el servidor donede se ejcuta argocd
        ARGO_PROJECT = 'miapp1' // el nombre del  proyecto  de argocd
        NAMESPACE = 'app-desarollo' // espacio de nombre donde va a publicar el proyecto el espacio de nombres
    }

    stages {
        stage('Security Scan and Build Backend and Frontend') {
            steps {
                container('trivy') {
                    dir('backend') {
                        script {
                            sh "trivy --version"
                            sh "trivy fs --exit-code 1 --severity UNKNOWN,LOW,HIGH,CRITICAL ."
                        }
                    }
                      dir('frontend') {
                        script {
                            sh "trivy --version"
                            sh "trivy fs --exit-code 1 --severity UNKNOWN,LOW,HIGH,CRITICAL ."
                        }
                    }
                }
            }
        }

stage('Análisis de SonarQube and frontend y backend') {
    steps {
        script {
            nodejs(nodeJSInstallationName: 'nodejs') {
                dir('backend') {
                sh 'npm install'
                    withSonarQubeEnv('sonar') {
                        sh 'npm install sonar-scanner'
                        sh 'npm run sonar'
                    }
                }

				      dir('frontend') {
						   sh 'npm install'
                    withSonarQubeEnv('sonar') {
                        sh 'npm install sonar-scanner'
                        sh 'npm run sonar'
                    }
                }
            }
        }
    }
}


        stage('Login-Into-Docker') {
            steps {
                container('docker') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'jenkins-panel', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                            sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                        }
                    }
                }
            }
        }



        stage('Build Backend') {
            steps {
                container('docker') {
                    dir('backend') {
                        script {
                             def backendImageTag = "${DOCKER_REPO_BACKEND}:${APP_VERSION}-${BUILD_NUMBER}"
                            sh "docker build -t $backendImageTag ."
                            sh "docker push $backendImageTag"
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                container('docker') {
                    dir('frontend') {
                        script {
                            def frontendImageTag = "${DOCKER_REPO_FRONTEND}:${APP_VERSION}-${BUILD_NUMBER}"
                            sh "docker build -t $frontendImageTag ."
                            sh "docker push $frontendImageTag"
                        }
                    }
                }
            }
        }

        stage('Security Scan with Trivy') {
            steps {
                container('trivy') {
                    script {
                        def backendImageTag = "${DOCKER_REPO_BACKEND}:${APP_VERSION}-${BUILD_NUMBER}"
                        def frontendImageTag = "${DOCKER_REPO_FRONTEND}:${APP_VERSION}-${BUILD_NUMBER}"
                        sh "trivy --version"
                        sh "trivy image --no-progress --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL $backendImageTag"
                        sh "trivy image --no-progress --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL $frontendImageTag"
                    }
                }
            }
        }

        stage('Deploy with ArgoCD') {
            steps {
                script {
                    withCredentials([ string(credentialsId: 'argocd-tocken', variable: 'ARGO_TOKEN')]) {
                        sh "curl -sSL -k -o argocd https://${ARGOCD_SERVER}/download/argocd-linux-amd64"
                        sh "chmod 755 argocd"
                        sh "./argocd app set ${ARGO_PROJECT} -p backend_images=\"${DOCKER_REPO_BACKEND}:${APP_VERSION}-${BUILD_NUMBER}\" -p namespace=\"${NAMESPACE}\" --auth-token \$ARGO_TOKEN --insecure"
                        sh "./argocd app set ${ARGO_PROJECT} -p frontend_images=\"${DOCKER_REPO_FRONTEND}:${APP_VERSION}-${BUILD_NUMBER}\" -p namespace=\"${NAMESPACE}\" --auth-token \$ARGO_TOKEN --insecure"
                        //sh "./argocd app sync ${ARGO_PROJECT} --auth-token \$ARGO_TOKEN --insecure"
                        sh "rm argocd"
                        echo "Deployed done"
                    }
                }
            }
        }
    }

    post {
        always {
            container('docker') {
                sh 'docker logout'
            }
        }
    }
}