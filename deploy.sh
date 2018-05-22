#!/bin/sh
usage() {
    echo "Usage: ./deploy.sh [options]"
    echo
    echo "  -n package name            Default: esnavi.tar.gz"
    echo "  -a remote account name     Require"
    echo "  -s remote server           Require"
    echo "  -p port                    Default: 22"
    echo
    exit 1
}

DEPLOY_PACKAGE="esnavi.tar.gz"
PORT=22
WEB_APPS=/opt/tomcat/webapps/
CLIENT_NAME=esnavi

while [ "$1" != "" ]; do
    case $1 in
        -n)
            shift
            DEPLOY_PACKAGE=$1
            ;;
        -a)
            shift
            ACCOUNT=$1
            ;;
        -s)
            shift
            SERVER=$1
            ;;
        -p)
            shift
            PORT=$1
            ;;
        * )                     usage
                                exit 1
    esac
    shift
done

if [ ! $DEPLOY_PACKAGE ] || [ ! $ACCOUNT ] || [ ! $SERVER ] || [ ! $PORT ]
then
  usage
fi

echo "================================"
echo "   package name: $SERVICE"
echo "   account     : $ACCOUNT"
echo "   server      : $SERVER"
echo "   port        : $PORT"
echo "================================"
echo

scp -P $PORT ./$DEPLOY_PACKAGE $ACCOUNT@$SERVER:$WEB_APPS
echo "Copied package to production server successfully."

ssh $ACCOUNT@$SERVER -p $PORT << EOF
echo "SSH successfully."

# remove old package
rm -rf $WEB_APPS$CLIENT_NAME
echo "Deleted old package successfully."

# create folder if not exist
mkdir -p $WEB_APPS$CLIENT_NAME

# unzip deployed package
tar -zxvf $WEB_APPS$DEPLOY_PACKAGE -C $WEB_APPS$CLIENT_NAME

echo "Deployed new package successfully."
EOF
