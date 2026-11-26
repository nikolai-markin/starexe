from ipaddress import ip_network,ip_address
from pathlib import Path
assert int(ip_address('232.126.150.18'))-int(ip_network('232.126.150.18/20',strict=False).network_address)==1554
assert int(ip_address('206.158.124.67'))-int(ip_network('206.158.124.67/19',strict=False).network_address)==7235
assert str(ip_network('240.144.182.134/21',strict=False).network_address)=='240.144.176.0'
assert str(ip_network('217.9.235.133/21',strict=False).network_address)=='217.9.232.0'
assert str(ip_network('255.111.32.96/18',strict=False).network_address)=='255.111.0.0'
n=ip_network('192.168.32.160/28'); assert sum(int(a).bit_count()%2==0 for a in n)==8
assert sum(int(a).bit_count()%2==0 for a in n.hosts())==6
assert sum(f'{a:b}'[16:].count('1')>=f'{a:b}'[:16].count('1') for a in ip_network('253.112.169.12/23',strict=False))==46
assert min(int(str(ip_network('111.81.88.168/'+str(p),strict=False).netmask).split('.')[-1]) for p in range(33) if str(ip_network('111.81.88.168/'+str(p),strict=False).network_address)=='111.81.88.160')==224
assert max(p for p in range(33) if str(ip_network('93.138.70.47/'+str(p),strict=False).network_address)=='93.138.64.0')==21
masks=[0,128,192,224,240,248,252,254,255]
assert min(a for a in masks if all(f'{ip:b}'[:16].count('1')>=f'{ip:b}'[16:].count('1') for ip in ip_network(f'255.211.33.160/255.255.{a}.0',strict=False)))==240
assert min(a for a in range(256) if all(f'{ip:b}'[:16].count('1')<=f'{ip:b}'[16:].count('1') for ip in ip_network(f'32.0.{a}.5/20',strict=False)))==16
print('All numerical reference checks passed')
