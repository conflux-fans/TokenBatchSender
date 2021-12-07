# csv usecases

本页提供部分 CSV 的测试用例

CSV 的整体规则如下：

1. 空行判断。允许存在空行。空行会被自动忽略（典型如文件结尾的空行）
2. 列数判断。非空行必须有两列（即每行有一个 `,`）
3. 每列处理。每列首位的空格会被去掉。
4. title 行。
   1. 允许title 行为空。
   2. 如果CSV的第一行不为空。那么会检查是否为 `address` 与 `amount`。
      1. 如果是，则忽略该行（视为空行）。
      2. 否，则视为正常行
5. 正常行。正常的数据行有两列，分别第一列为地址，第二列为转账数额。
6. 地址合法性判断。
   1. 每行地址的合法性独立进行判断。
   2. 地址格式判断。hex地址，主网地址，测试网地址各有适用规则。主网地址与hex地址可以在任意网络内使用，测试网地址不可在主网内使用。
   3. Conflux 网络中，一个合法的 hex 地址需要由 0x0 / 0x1 / 0x8 开头
   4. 其余地址合法性的检测由 sdk 负责解析
7. 转账数额判断：是一个大于 0 的数 （非`NaN`）
8. 上传 csv 时会逐行检查每行的错误，并给出整体的出错情况（具体至行）
   1. 但如果一行内存在多个错误，仍然只会报其中的一个错误

下面会使用[csv1](./csv1.csv)与[csv2](./csv2.csv)作为例子


``` csv
address, amount

0x1e0cc11e4dc7208e74e20ce3060fdffc88680514, 0.300
0x1ed71ee0fe63300e0f966546fc5091ba971a3581, 0.500
0x1ed71ee0fe63300e0f966546fc5091ba971a3581, 0.500, 114
0x1ed71ee0fe63300e0f966546fc5091ba971a3581,
0x1ed71ee0fe63300e0f966546fc5091ba971a3581
0x2ed71ee0fe63300e0f966546fc5091ba971a3581, 0.500


cfx:aaj98r9s6dzrrudd1aenmr8tvah5zn4styyd8c38j2, 2.3
cfx:aaj98r9s6dzrrudd1aenmr8tvah5zn4styyd8c38j2, 0
cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w13, 2.900
cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w13, -2.900
cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w14, 2.900


```

## 选择CSV错误

1. 点击csv选择框选择文件，或从文件管理器中将相应文件拖拽至csv选择框
2. 不合法的文件会弹出红色报错框
   1. 非csv文件会提示非csv文件
   2. 主网中选择[csv1](./csv1.csv)文件，会给出以下报错
      ``` 
      ERROR: CSV ROW 5 - column count is not 2
      ERROR: CSV ROW 6 - Unexpected value: empty value
      ERROR: CSV ROW 7 - column count is not 2
      ERROR: CSV ROW 8 - A valid conflux hex address is expected to start with 0x0, 0x1, or 0x8
      ERROR: CSV ROW 12 - Transfer amount should be greater than zero: 0
      ERROR: CSV ROW 13 - Address is not valid for current network: cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w13
      ERROR: CSV ROW 14 - Address is not valid for current network: cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w13
      ERROR: CSV ROW 15 - Invalid checksum for cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w14
      ```
   3. 测试网中选择[csv1](./csv1.csv)文件，会给出以下报错
      ```
      ERROR: CSV ROW 5 - column count is not 2
      ERROR: CSV ROW 6 - Unexpected value: empty value
      ERROR: CSV ROW 7 - column count is not 2
      ERROR: CSV ROW 8 - A valid conflux hex address is expected to start with 0x0, 0x1, or 0x8
      ERROR: CSV ROW 12 - Transfer amount should be greater than zero: 0
      ERROR: CSV ROW 14 - Transfer amount should be greater than zero: -2.900
      ERROR: CSV ROW 15 - Invalid checksum for cfxtest:aanhtnrex2nj56kkbws4yx0jeab34ae16pcap53w14
      ```
3. 点击 “重置CSV文件”，CSV框恢复原样，可以再次上传

## 选择CSV 加载

1. 点击csv选择框选择文件，或从文件管理器中将相应文件拖拽至csv选择框
2. 若文件（如[csv2](./csv2.csv)）合法，加载成功后会显示转账总数、转账条数，并以表格形式列出。表格下方会出现“重置CSV文件”，“批量转账”按钮
   1. 若文件较大 加载时表格上会出现转圈符号

## 选择CSV 重置

0. 已选择CSV（出错/未出错）
1. 点击“重置CSV文件”
2. CSV被重置，页面恢复选择CSV前的样子
3. 可以再次上传新CSV文件
