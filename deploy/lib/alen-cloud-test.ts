import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface AlenCloudTestProps extends cdk.StackProps {
  wgAdminPasswordSecretArn: string;
}

export class AlenCloudTest extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AlenCloudTestProps) {
    super(scope, id, props);
    const vpc = cdk.aws_ec2.Vpc.fromLookup(this, "DefaultVPC", {
      isDefault: true,
    });

    const instanceName = "alen-cloud-test";

    const keyPairName = "alen-cloud-test-keypair";

    const keyPair = new cdk.aws_ec2.CfnKeyPair(this, keyPairName, {
      keyName: keyPairName,
    });

    const securityGroup = new cdk.aws_ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      allowAllOutbound: true,
      securityGroupName: `${instanceName}-security-group`,
    });

    securityGroup.addIngressRule(
      cdk.aws_ec2.Peer.anyIpv4(),
      cdk.aws_ec2.Port.tcp(22),
      "Allows SSH access"
    );

    const role = new cdk.aws_iam.Role(this, `${instanceName}-role`, {
      assumedBy: new cdk.aws_iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const ubuntuDistro: "focal" | "jammy" = "jammy";

    const rootVolume: cdk.aws_ec2.BlockDevice = {
      deviceName: "/dev/sda1",
      volume: cdk.aws_ec2.BlockDeviceVolume.ebs(30),
    };

    const hostUserName = "ubuntu";
    const userData = cdk.aws_ec2.UserData.forLinux();
    userData.addCommands(
      "sudo apt update",
      "sudo apt upgrade -y",
      "sudo apt install awscli wireguard openresolv net-tools docker.io make -y",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      `sudo usermod -a -G docker ${hostUserName}` // Add user to the docker group, so that docker commands don't have to be run as sudo
    );

    // NVM and Node and stuff
    userData.addCommands(
      `echo "Setting up NodeJS Environment"`,
      `export HOME=/home/${hostUserName}`, // set HOME env var for the install script to work properly
      `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash`,
      `. /home/${hostUserName}/.nvm/nvm.sh`, // Dot source the files to ensure that variables are available within the current shell
      `. /home/${hostUserName}/.profile`,
      `. /home/${hostUserName}/.bashrc`,
      `nvm install 18`,
      `npm install --global yarn`
    );

    userData.addCommands(
      'echo "Installing ROS2"',
      "sudo apt install software-properties-common -y",
      "sudo add-apt-repository universe",
      "sudo apt update && sudo apt install curl -y",
      "sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg",
      'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null',
      "sudo apt update",
      "sudo apt upgrade -y",
      "sudo apt install ros-humble-desktop ros-humble-rmw-cyclonedds-cpp -y"
    );

    userData.addCommands("Done with user data stuffs!");

    const instance = new cdk.aws_ec2.Instance(this, instanceName, {
      vpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: instanceName,
      instanceType: cdk.aws_ec2.InstanceType.of(
        cdk.aws_ec2.InstanceClass.T2,
        cdk.aws_ec2.InstanceSize.MICRO
      ),
      blockDevices: [rootVolume],
      machineImage: cdk.aws_ec2.MachineImage.fromSsmParameter(
        `/aws/service/canonical/ubuntu/server/${ubuntuDistro}/stable/current/amd64/hvm/ebs-gp2/ami-id`,
        {}
      ),
      keyName: keyPair.keyName,
      userData,
    });

    const ssmPolicy = cdk.aws_iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      "SsmPolicy",
      "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
    );

    instance.role.addManagedPolicy(ssmPolicy);

    instance.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
        ],
        resources: [props.wgAdminPasswordSecretArn],
      })
    );

    const wgAdminPasswordSecret =
      cdk.aws_secretsmanager.Secret.fromSecretPartialArn(
        this,
        "WgAdminPasswordSecret",
        props.wgAdminPasswordSecretArn
      );
    wgAdminPasswordSecret.grantRead(instance);
    wgAdminPasswordSecret.grantWrite(instance);
  }
}
