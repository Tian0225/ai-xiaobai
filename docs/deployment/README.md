# 部署文档入口

更新时间：2026-02-12（本地时区）
项目路径：`/Users/jitian/Documents/ai-xiaobai`

## 快速选择

1. 只上线后台运营与权限（P1）
- 文档：`docs/deployment/p1-admin-ops-go-live-checklist.md`
- 范围：管理员访问边界、会员开通/撤销/恢复、订单核销、操作日志、误操作防护。

2. 上线支付与完整部署链路（P2）
- 文档：`docs/deployment/p2-go-live-runbook.md`
- 范围：环境变量校验、支付回调、对账、验收脚本、Vercel 回滚。

3. 发布风险登记
- 文档：`docs/deployment/known-issues-template.md`
- 范围：上线前后问题清单、影响评估、临时规避、回滚条件。

4. 发布前最终演练单（推荐发布当天执行）
- 文档：`docs/deployment/final-preflight-drill.md`
- 范围：命令级演练、通过标准、失败止损、发布决策门。

5. 发布执行记录模板（推荐值班留档）
- 文档：`docs/deployment/release-execution-record-template.md`
- 范围：勾选项、验收签字、Go/No-Go 决策与追踪。

6. 发布执行记录样例（本次 P1 预填）
- 文档：`docs/deployment/release-execution-record-2026-02-13-p1-sample.md`
- 范围：基于当前改动预填，发布时补值班信息与现场结果即可。

## 推荐执行顺序

1. 先跑 P1 清单，确保后台权限与运营功能可控可追踪。
2. 再跑 P2 Runbook，完成支付与部署全链路检查。
3. 如有风险项，落到 known issues 模板后再决定是否发布。
4. 发布当天执行 final preflight drill，再做 Go/No-Go。
5. 发布结束后填写 release execution record 并归档。
