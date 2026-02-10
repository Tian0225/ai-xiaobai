import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, name, phone, email, employees, needs } = body;

    // 验证必填字段
    if (!company || !name || !phone || !needs) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "请输入有效的手机号" },
        { status: 400 }
      );
    }

    // 验证邮箱格式（如果提供）
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "请输入有效的邮箱地址" },
          { status: 400 }
        );
      }
    }

    // TODO: 实际项目中，这里应该：
    // 1. 保存到数据库（Supabase）
    // 2. 发送通知邮件给销售团队
    // 3. 发送确认短信给客户
    // 4. 集成到 CRM 系统

    // 模拟保存到数据库
    const consultation = {
      id: Date.now(),
      company,
      name,
      phone,
      email: email || null,
      employees: employees || null,
      needs,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("New enterprise consultation request:", consultation);

    // 这里可以添加邮件通知逻辑
    // await sendNotificationEmail({
    //   to: "sales@ai-xiaobai.com",
    //   subject: `新的企业咨询 - ${company}`,
    //   body: `
    //     公司：${company}
    //     联系人：${name}
    //     电话：${phone}
    //     邮箱：${email || '未提供'}
    //     规模：${employees || '未提供'}
    //     需求：${needs}
    //   `,
    // });

    return NextResponse.json(
      {
        success: true,
        message: "预约成功，我们将在 24 小时内与您联系",
        data: consultation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing consultation request:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
