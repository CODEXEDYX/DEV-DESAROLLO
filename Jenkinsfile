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
        APP_VERSION = '0.0.1'
        DOCKER_REPO_BACKEND = 'codexedyx/jenkins-backend'
        DOCKER_REPO_FRONTEND = 'codexedyx/jenkins-frontend'
        ARGOCD_SERVER = '127.0.0.1:8080'
        ARGO_PROJECT = 'miapp1'
        NAMESPACE = 'argocd'
    }

    stages {
        stage('Security Scan and Build Backend') {
            steps {
                container('trivy') {
                    dir('backend') {
                        script {
                            sh "trivy --version"
                            sh "trivy fs --exit-code 1 --severity UNKNOWN,LOW,HIGH,CRITICAL ."
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
                nodejs('NodeJS-20.9.0') {
                    sh 'yarn -v'
                    sh 'yarn install'
                }

                container('docker') {
                    dir('backend') {
                        script {
                             def backendImageTag = "${DOCKER_REPO_BACKEND}:${APP_VERSION}"
                            sh "docker build -t $backendImageTag ."
                            sh "docker push $backendImageTag"
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                nodejs('NodeJS-20.9.0') {
                    sh 'yarn -v'
                    sh 'yarn install'
                }

                container('docker') {
                    dir('frontend') {
                        script {
                            def frontendImageTag = "${DOCKER_REPO_FRONTEND}:${APP_VERSION}"
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
                        def backendImageTag = "${DOCKER_REPO_BACKEND}:${APP_VERSION}"
                        def frontendImageTag = "${DOCKER_REPO_FRONTEND}:${APP_VERSION}"
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
                        sh "./argocd app set ${ARGO_PROJECT} -p backend_images=\"${DOCKER_REPO_BACKEND}:${APP_VERSION}\" -p namespace=\"${NAMESPACE}\" --auth-token ${ARGO_TOKEN}"
                        sh "./argocd app set ${ARGO_PROJECT} -p frontend_images=\"${DOCKER_REPO_FRONTEND}:${APP_VERSION}\" -p namespace=\"${NAMESPACE}\" --auth-token ${ARGO_TOKEN}"
                        sh "./argocd app sync ${ARGO_PROJECT} --auth-token ${ARGO_TOKEN}"
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