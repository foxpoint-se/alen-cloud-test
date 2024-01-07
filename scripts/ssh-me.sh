#!/bin/bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
. "$DIR/common.sh"

echo "Getting public DNS for server with name $serverName"
publicDns=$(getPublicDns "$serverName")
echo SSH to $publicDns using your public key

ssh $userName@$publicDns
