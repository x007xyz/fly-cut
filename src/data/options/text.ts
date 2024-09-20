import { mappingFormItem } from '@/utils/formItemUtils';
// 元素属性配置
export const Options = {
    attributes: [
        mappingFormItem('Tabs', {
            children: [
                mappingFormItem('TabPane', {
                    name: '属性',
                    children: [
                        mappingFormItem('Collapse', {
                            children: [
                                mappingFormItem('CollapsePane', {
                                    name: '位置',
                                    children: [
                                        mappingFormItem('Flex', { attr: { col: 2 }, name: '位置', children: [
                                                mappingFormItem('Number', { attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'x', mappingKey: 'centerX', defaultValue: 0 }),
                                                mappingFormItem('Number', { attr: {
                                                        controlsPosition: 'right'
                                                    }, name: 'y', mappingKey: 'centerY', defaultValue: 0 })
                                            ] }),
                                        mappingFormItem('Slider', { attr: {
                                                min: 1,
                                                max: 200,
                                                step: 1
                                            }, name: '缩放', mappingKey: 'scale', defaultValue: 100, label: '%' })
                                    ]
                                })
                            ]
                        }),
                        mappingFormItem('Collapse', {
                            children: [
                                mappingFormItem('CollapsePane', {
                                    name: '文字',
                                    children: [
                                        mappingFormItem('Number', { attr: {
                                                controlsPosition: 'right'
                                            }, name: '字号', mappingKey: 'fontSize', defaultValue: 40 }),
                                        mappingFormItem('TextArea', { attr: {
                                                autosize: {
                                                    minRows: 1,
                                                    maxRows: 4
                                                },
                                                placeholder: '请输入内容'
                                            }, name: '内容', mappingKey: 'content', defaultValue: '默认文本' }),
                                        mappingFormItem('Color', { name: '颜色', mappingKey: 'fill', defaultValue: '#ffffff' }),
                                        mappingFormItem('Color', { name: '描边', mappingKey: 'stroke' }),
                                        mappingFormItem('Color', { name: '背景', mappingKey: 'textBackgroundColor' })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                mappingFormItem('TabPane', {
                    name: '动画',
                    children: []
                })
            ]
        })
    ]
};