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
                       
                       //def backendImageTag = "codexedyx/jenkins-backend:${BUILD_NUMBER}.0"
                       //def frontendImageTag = "codexedyx/jenkins-frontend:${BUILD_NUMBER}.0"
                       //sh "sed -i 's|backend_images:.*|backend_images: $backendImageTag|' ./helm-repo/values.yaml"
                       //sh "sed -i 's|frontend_images:.*|frontend_images: $frontendImageTag|' ./helm-repo/values.yaml"


                       def backendImageTag = "codexedyx/jenkins-backend:${BUILD_NUMBER}.0"
                       def frontendImageTag = "codexedyx/jenkins-frontend:${BUILD_NUMBER}.0"

                       env.BACKEND_IMAGE_TAG = backendImageTag
                       env.FRONTEND_IMAGE_TAG = frontendImageTag
                       
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