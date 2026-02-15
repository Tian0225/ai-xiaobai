#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const args = {
    input: 'redeem-codes-500.txt',
    output: 'output/redeem-codes-500.sql',
    source: 'ldxp-membership-batch',
    expiresAt: '',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i]
    if (item === '--input') args.input = argv[i + 1] ?? args.input
    if (item === '--output') args.output = argv[i + 1] ?? args.output
    if (item === '--source') args.source = argv[i + 1] ?? args.source
    if (item === '--expires-at') args.expiresAt = argv[i + 1] ?? args.expiresAt
  }

  return args
}

function escapeSql(value) {
  return value.replace(/'/g, "''")
}

function readCodes(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().toUpperCase())
    .filter(Boolean)

  const unique = [...new Set(lines)]
  return unique.filter((line) => /^[A-Z0-9]{16,64}$/.test(line))
}

function buildSql(codes, source, expiresAt) {
  const sourceValue = escapeSql(source)
  const expiresSql = expiresAt ? `'${escapeSql(expiresAt)}'::timestamptz` : 'NULL'
  const values = codes
    .map(
      (code) =>
        `('${escapeSql(code)}', 'unused', '${sourceValue}', ${expiresSql}, now(), now())`
    )
    .join(',\n')

  return [
    '-- 自动生成：卡密导入 SQL',
    '-- 执行前请先运行 docs/sql/redeem_codes.sql',
    '',
    'insert into public.redeem_codes (code, status, source, expires_at, created_at, updated_at)',
    'values',
    values,
    'on conflict (code) do nothing;',
    '',
  ].join('\n')
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const inputPath = path.resolve(process.cwd(), args.input)
  const outputPath = path.resolve(process.cwd(), args.output)

  if (!fs.existsSync(inputPath)) {
    console.error(`输入文件不存在: ${inputPath}`)
    process.exit(1)
  }

  const codes = readCodes(inputPath)
  if (codes.length === 0) {
    console.error('未读取到有效卡密，请检查输入文件格式')
    process.exit(1)
  }

  const sql = buildSql(codes, args.source, args.expiresAt)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, sql, 'utf8')

  console.log(`生成成功: ${outputPath}`)
  console.log(`有效卡密数量: ${codes.length}`)
}

main()
