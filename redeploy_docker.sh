CONTAINER=$1
PORT=$2
IMAGE_TAG=$3

if [ "a${CONTAINER}" == "a" ]; then
  echo "The first argument needs to be a container id or friendly name"
  exit 1
fi

if [ "a${PORT}" == "a" ]; then
  echo "The second argument needs to be the host network port to expose"
  exit 2
fi

RESTARTING=$(docker inspect --format="{{.State.Restarting}}" $CONTAINER)

if [ "$RESTARTING" == "true" ]; then
    echo "CRITICAL: Container is RESTARTING - hung from previous build?"
    docker stop $CONTAINER
    docker rm $CONTAINER
fi

RUNNING=$(docker inspect --format="{{.State.Running}}" $CONTAINER 2> /dev/null)

if [ "$RUNNING" == "false" ]; then 
    docker rm $CONTAINER
fi

if [ "$RUNNING" == "true" ]; then 
    docker stop $CONTAINER
    docker rm $CONTAINER
fi

docker run --name=$CONTAINER --restart=always -p$PORT:3000 -d docker.dev.lab10.io/p4p:$IMAGE_TAG
