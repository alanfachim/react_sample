$aplicationName="fiap-rafael-next"
$myDeployBucket="$($aplicationName)-alanfachim"

aws s3 rb s3://$myDeployBucket --force   
aws s3api create-bucket --bucket $myDeployBucket --region sa-east-1  --create-bucket-configuration LocationConstraint=sa-east-1 
aws s3 cp .\templates s3://$myDeployBucket/templates --recursive

echo "pronto para iniciar a criação do ambiente"
pause
sam deploy --template-file .\templates\Aplication.yaml  --stack-name $aplicationName --capabilities CAPABILITY_IAM --region sa-east-1 --force-upload --parameter-overrides  LaunchType=Fargate TemplateBucket=$myDeployBucket GitHubBffRepo=$aplicationName GitHubFrontRepo=$aplicationName-front
 
$CloneUrlBff = aws cloudformation  describe-stacks --stack-name $aplicationName --query "Stacks[0].Outputs[?OutputKey=='CloneUrlBff'].OutputValue" --output text   
$mainUrl=aws cloudformation  describe-stacks --stack-name $aplicationName --query "Stacks[0].Outputs[?OutputKey=='mainUrl'].OutputValue" --output text   
  
cd .\src
Remove-Item -Recurse .git\ -Force
git init
git remote add origin $CloneUrlBff
git add .
git commit -m "commit inicial"
git push --set-upstream origin master
echo "----------------------------------------"
echo $mainUrl
echo "----------------------------------------"
pause
