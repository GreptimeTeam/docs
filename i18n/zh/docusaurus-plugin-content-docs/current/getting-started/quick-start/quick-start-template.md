
import Includeintroduction from './introduction.md' 

<Includeintroduction/>

## 准备事项

import Includeprerequisites from './prerequisites.md' 

<Includeprerequisites/>

## 写入数据

{props.children.length ? props.children.filter(c => c.props.id == 'write-data') : props.id === 'write-data' ? props.children : null}

## 使用 Grafana 可视化数据
import Includevisualizedatabygrafana from './visualize-data-by-grafana.md' 

<Includevisualizedatabygrafana/>

## 下一步

import Includenextsteps from './next-steps.md' 

<Includenextsteps/>
