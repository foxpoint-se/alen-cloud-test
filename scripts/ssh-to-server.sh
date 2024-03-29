#!/bin/bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/common.sh"

sshToServer() {
    fileName=$1
    user=$2
    dns=$3
    ssh -i $fileName $user@$dns
}

echo "Getting public DNS for server with name $serverName"
publicDns=$(getPublicDns "$serverName")
echo "SSH to $publicDns"
sshToServer $pemFileName $userName $publicDns
