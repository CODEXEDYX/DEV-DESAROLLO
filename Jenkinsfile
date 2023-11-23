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
  - name: argocd
    image: argoproj/argocd:v2.6.15
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
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

					  dir('frontend') {
								script{
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

stage('Login to ArgoCD') {
    steps {
        script {
            sh "curl -LO https://github.com/argoproj/argo-cd/releases/download/v2.7.2/argocd-linux-amd64 && chmod +x argocd-linux-amd64 && mv argocd-linux-amd64 /usr/local/bin/argocd"
            def argoCDServer = "https://127.0.0.1:8080/"  // Reemplaza con la URL de tu servidor de ArgoCD
            def argoCDToken = "jenkins-argocd-dev"  // Reemplaza con tu token de ArgoCD

            // Autenticación en ArgoCD
            sh "argocd login $argoCDServer --insecure --username admin --password $argoCDToken"
        }
      }
}


stage('Deploy to ArgoCD') {
    steps {
        script {
            def appName = "desarollo"  // Reemplaza con el nombre de tu aplicación en ArgoCD
            def argoServer = "https://127.0.0.1:8080/"  // Reemplaza con la URL de tu servidor de ArgoCD
            def argoToken = "jenkins-argocd-dev"  // Reemplaza con tu token de ArgoCD

            // Configuración de aplicación para ArgoCD
            sh "kubectl apply -f ./path/to/your/argo-cd-app-config.yaml"

            // Despliega la aplicación en ArgoCD
            sh "argocd app sync $appName --server $argoServer --auth-token $argoToken"
        }
    }
}



stage('ArgoCD Notification') {
    steps {
        script {
            def argoCDServer = "https://127.0.0.1:8080/"  // Reemplaza con la URL de tu servidor de ArgoCD
            def argoCDToken = "jenkins-argocd-dev"  // Reemplaza con tu token de ArgoCD

            def argoCDNotificationConfig = """
              apiVersion: v1
              kind: ConfigMap
              metadata:
                name: argocd-notifications-cm
                namespace: argocd
              data:
                service.webhook.jenkins: |
                  url: $argoCDServer/api/webhook?token=$argoCDToken
                  headers:
                    - name: Content-Type
                      value: application/json
                  insecureSkipVerify: true
                template.github-commit-status: |
                  webhook:
                    jenkins:
                      method: POST
                      path: /generic-webhook-trigger/invoke
                      body: |
                        {
                          "jobName": "my_backend",
                          "status": "\$app.status.operationState.phase",
                          "commitSHA": "\$app.spec.source.targetRevision"
                        }
                trigger.my-trigger-name: |
                  - when: app.status.operationState.phase in ['Succeeded']
                    send: [github-commit-status]
            """

            sh "echo '$argoCDNotificationConfig' | kubectl apply -f -"
        }
    }
}


  
        stage('Build Backend') {
            steps {

                 nodejs('NodeJS-20.9.0'){
                          sh 'yarn -v'

                          sh 'yarn install'
                  }

               container('docker') {
                dir('backend') {
                    script {
              
                            def backendImageTag = "codexedyx/jenkins-backend:${BUILD_NUMBER}.0"

                            sh "docker build -t $backendImageTag ."

                            sh "docker push $backendImageTag"

                  }
                }
              }
            }
        }
        stage('Build Frontend') {
            steps {

              nodejs('NodeJS-20.9.0'){
                          sh 'yarn -v'

                          sh 'yarn install'
                  }

             

              container('docker')  {

                dir('frontend') {
                    script {                        

                        def frontendImageTag = "codexedyx/jenkins-frontend:${BUILD_NUMBER}.0"

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
                def backendImageTag = "codexedyx/jenkins-backend:${BUILD_NUMBER}.0"
                def frontendImageTag = "codexedyx/jenkins-frontend:${BUILD_NUMBER}.0"

                sh "trivy --version"
                sh "trivy image --no-progress --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL $backendImageTag"
                sh "trivy image --no-progress --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL $frontendImageTag"
            }
        }
    }
}





          stage('Deploy to Kubernetes') {
            steps {
                dir('K8s') {
                    script {

                       
                       def backendImageTag = "codexedyx/jenkins-backend:${BUILD_NUMBER}.0"

                       def frontendImageTag = "codexedyx/jenkins-frontend:${BUILD_NUMBER}.0"

                       sh "sed -i 's|backend_images:.*|backend_images: $backendImageTag|' ./helm-repo/values.yaml"

                       sh "sed -i 's|frontend_images:.*|frontend_images: $frontendImageTag|' ./helm-repo/values.yaml"
                       
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