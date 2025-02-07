import requests
from tabulate import tabulate

try:
    # 发送请求获取质粒数据
    response = requests.get('http://localhost:3000/plasmids')
    # 检查请求是否成功
    response.raise_for_status()
    # 解析响应的 JSON 数据
    plasmids = response.json()

    # 提取表头
    headers = plasmids[0].keys() if plasmids else []
    # 提取表格数据
    rows = [list(plasmid.values()) for plasmid in plasmids]

    # 打印表格
    print(tabulate(rows, headers=headers, tablefmt='fancy_grid'))

except requests.RequestException as e:
    print(f"网络请求出错: {e}")
except ValueError as e:
    print(f"JSON 解析出错: {e}")
except Exception as e:
    print(f"发生未知错误: {e}")