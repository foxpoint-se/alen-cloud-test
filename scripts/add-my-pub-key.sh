keyName=alen-cloud-test-keypair
serverName=alen-cloud-test
pemFileName=root.pem
userName=ubuntu

getPublicDns() {
    name=$1
    filter=Name=tag:Name,Values=$name
    aws ec2 describe-instances --filters $filter --output text --query 'Reservations[*].Instances[*].PublicDnsName'
}

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
