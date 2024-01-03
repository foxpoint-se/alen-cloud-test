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
    });

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
