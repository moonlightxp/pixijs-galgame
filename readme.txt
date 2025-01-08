pixijs官网:
@https://pixijs.com/ 

相关文档:
@https://pixijs.com/8.x/guides 
@https://pixijs.com/8.x/tutorials 
@https://pixijs.com/8.x/examples 

Git 回退操作指南:

1. 查看提交历史
   git log                  # 查看完整历史
   git log --oneline        # 查看简洁历史（每个提交一行）

2. 回退命令
   git reset [模式] [commit ID]  # 通用格式
   
   三种回退模式:
   - soft模式:  git reset --soft [commit ID]
     * 保留工作目录的修改
     * 保留暂存区的状态（保留 git add 的文件）
     * 适用于：想保留所有修改，但撤销提交
   
   - mixed模式: git reset --mixed [commit ID]  或  git reset [commit ID]
     * 保留工作目录的修改
     * 清空暂存区（需要重新 git add）
     * 适用于：想保留修改，但重新组织提交
   
   - hard模式:  git reset --hard [commit ID]
     * 清空工作目录的所有修改
     * 清空暂存区
     * 适用于：想完全放弃所有改动
     * 警告：此操作会丢失所有未提交的修改！

3. 远程仓库同步
   如果需要将回退后的状态推送到远程仓库：
   git push -f origin [分支名]    # 强制推送，谨慎使用

注意事项：
1. 使用 hard 模式前请确保已备份重要内容
2. 强制推送会覆盖远程分支历史，团队协作时需要谨慎
3. commit ID 不需要完整，前几位足够唯一标识即可 