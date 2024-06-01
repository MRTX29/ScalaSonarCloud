CONTAINER_NAME=my_scala_api

APP_PORT=9000

docker run -d --name $CONTAINER_NAME -p $APP_PORT:$APP_PORT 0d047b23dcfd

ngrok http $APP_PORT