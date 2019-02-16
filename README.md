#人人影视添加任务脚本
1. 修改配置文件，添加节点参数（ip,port...）
2. yum install nodejs -y
3. npm install -g 
4. crontab -e //添加定时任务 */3 * * * * autotask -c path-of-config.json

