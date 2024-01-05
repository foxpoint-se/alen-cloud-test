#!/bin/bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/common.sh"

addMyPubKey() {
    pemFile=$1
    user=$2
    dns=$3
    pubKeyPath=$4
    pubKey=$(cat $pubKeyPath)
    cmd="echo "
    cmd+=$pubKey
    cmd+=" >> ~/.ssh/authorized_keys"
    ssh -i $pemFile $user@$dns $cmd
}

echo "Getting public DNS for server with name $serverName"
publicDns=$(getPublicDns "$serverName")
addMyPubKey $pemFileName $userName $publicDns ~/.ssh/id_rsa.pub

echo "Done!"
