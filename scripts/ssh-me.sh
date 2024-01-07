#!/bin/bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/common.sh"

sshUsingOwnKey() {
    user=$1
    dns=$2
    ssh $user@$dns
}

echo "Getting public DNS for server with name $serverName"
publicDns=$(getPublicDns "$serverName")
echo SSH to $publicDns using your public key

sshUsingOwnKey $userName $publicDns
