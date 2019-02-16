#人人影视添加任务脚本
1. 修改配置文件，添加节点参数（ip,port...）
2. curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
3. source .bashrc
4. nvm install node
5. node -v //查看版本是否v11
3. npm install -g 
4. crontab -e //添加定时任务 */3 * * * * autotask -c path-of-config.json

