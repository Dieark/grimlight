import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.40/vue.esm-browser.min.js'
const app = createApp({
    data() {
        return {
            allChars:[],
            char:{},
            level:70,
            searchFilter:'', // 搜尋篩選
            selectIcon:'', // 顯示小圖
            isSelectIcon:false,
            isDetail:false, //詳細素質
            isFullBody:false, //展開動畫
            elementFilter:'Element',
            classFilter:'Class',
            skin:'',
            skillLevel:5,
            nameActive:'',
            namePassive1:'',
            nameTrait1:'',
            nameTrait2:'',
            nameTrait3:'',
            descriptionActive:'',
            descriptionPassive1:'',
            descriptionTrait1:'',
            descriptionTrait2:'',
            descriptionTrait3:'',
            processedActive:{
                part1:'',
                part2:'',
                part3:'',
                part4:'',
                color1:'',
                color2:'',
                color3:'',
                value1:0,
                value2:0,
                value3:0
            },
            processedPassive:{
                part1:'',
                part2:'',
                part3:'',
                part4:'',
                color1:'',
                color2:'',
                color3:'',
                value1:0,
                value2:0,
                value3:0
            },
            ui_card_path:'src/img/UI_Card_S/UI_Card_Alice_S.png',
            player:null
        }
    },
    methods: {
        setDefault() {
            // 左側nav取得所有角色
            axios.get('src/json/chars.json')
              .then((res) => {
                console.log(res);
                this.allChars = res.data
                this.char = this.allChars[0] // 預設Alice
                this.level = 70 // 預設70等
                this.showChar(this.char)
              })
        },
        //中間主畫面取得某一角色
        showChar(item) {
            // 重設
            this.level = 70
            this.skillLevel = 5
            this.skin = ''
            // 取得小圖與spine動畫
            axios.get('src/json/chars.json')
              .then((res) => {
                console.log(res)
                const index = this.allChars.findIndex(obj => obj.name === item.name)
                this.char = res.data[index]
                this.ui_card_path = 'src/img/UI_Card_S/UI_Card_' + this.char.imgName +'_S.png'
                this.setSpine()
              })
            // 取得技能資訊
            axios.get('src/LanguageSource_Ability.json')
              .then((res) => {
                console.log('char:', this.char)
                this.nameActive = this.skillProcess1(res, this.char.srcName, this.nameActive, 'Names/Ability_', '_Active')
                this.namePassive1 = this.skillProcess1(res, this.char.srcName, this.namePassive1, 'Names/Ability_', '_Passive1')
                this.nameTrait1 = this.skillProcess1(res, this.char.srcName, this.nameTrait1, 'Names/Ability_', '_Trait1')
                this.nameTrait2 = this.skillProcess1(res, this.char.srcName, this.nameTrait2, 'Names/Ability_', '_Trait2')
                this.nameTrait3 = this.skillProcess1(res, this.char.srcName, this.nameTrait3, 'Names/Ability_', '_Trait3')
                this.descriptionActive = this.skillProcess1(res, this.char.srcName, this.descriptionActive, 'Description/Ability_', '_Active')
                this.descriptionPassive1 = this.skillProcess1(res, this.char.srcName, this.descriptionPassive1, 'Description/Ability_', '_Passive1')
                this.descriptionTrait1 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait1, 'Description/Ability_', '_Trait1')
                this.descriptionTrait2 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait2, 'Description/Ability_', '_Trait2')
                this.descriptionTrait3 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait3, 'Description/Ability_', '_Trait3')
                this.skillProcess2(this.descriptionActive, this.processedActive)
                this.skillProcess2(this.descriptionPassive1, this.processedPassive)
                console.log('active', this.nameActive, this.descriptionActive)
                console.log('passive', this.namePassive1, this.descriptionPassive1)
                console.log('trait1', this.nameTrait1, this.descriptionTrait1)
                console.log('trait2', this.nameTrait2, this.descriptionTrait2)
                console.log('trait3', this.nameTrait3, this.descriptionTrait3)
              })
        },
        skillProcess1(res, srcName, p, q, r) {
            p = res.data.mSource.mTerms.filter(item => item.Term.includes(q + srcName + r))[0]
            p = typeof(p) != 'undefined' ? p.Languages[0] : ''
            return p
        },
        skillProcess2(p, q) {
            q.part1 = p.indexOf('<color') > 0 ? p.slice(0, p.indexOf('<color')) : p.slice(0, p.indexOf('['))
            q.part2 = p.indexOf('<color') > 0 ? p.slice(p.indexOf('</color>') + 8, p.length) : p.slice(p.indexOf(']') + 1, p.length)
            q.color1 = p.indexOf('<color') > 0 ? p.slice(p.indexOf('<color') + 7, p.indexOf('>')) : 'currentColor'
            q.color1 = 'color: ' + q.color1 + ';'
            q.value1 = this.skillValueProcess(p)

            if (q.part2.indexOf('<color') > 0) {
                p = q.part2
                q.part2 = p.slice(0, p.indexOf('<color'))
                q.part3 = p.slice(p.indexOf('</color>') + 8, p.length)
                q.color2 = p.slice(p.indexOf('<color') + 7, p.indexOf('>'))
                q.color2 = 'color: ' + q.color2 + ';'
                q.value2 = this.skillValueProcess(p)
            }else {
                q.part3 = ''
            }

            if (q.part3.indexOf('<color') > 0) {
                p = q.part3
                q.part3 = p.slice(0, p.indexOf('<color'))
                q.part4 = p.slice(p.indexOf('</color>') + 8, p.length)
                q.color3 = p.slice(p.indexOf('<color') + 7, p.indexOf('>'))
                q.color3 = 'color: ' + q.color3 + ';'
                q.value3 = this.skillValueProcess(p)
            }else {
                q.part4 = ''
            }
            console.log(this.processedActive)
        },
        skillValueProcess(p) {
            if (p.indexOf('*') > 0){
                var operator = p.indexOf('*')
                var multiValue = parseInt(p.slice(p.indexOf('[') + 1, operator)) * (parseFloat(p.slice(operator + 1, p.indexOf(']'))) ** (this.skillLevel - 1))
            }else if (p.indexOf('+') > 0){
                var operator = p.indexOf('+')
                var multiValue = parseInt(p.slice(p.indexOf('[') + 1, operator)) + (parseInt(p.slice(operator + 1, p.indexOf(']'))) * (this.skillLevel - 1))
            }else {
                return p.slice(p.indexOf('>') + 1, p.indexOf('</color>'))
            }
            return String(Math.floor( ( multiValue + Number.EPSILON ) * 100 ) / 100) + '%'
        },
        //清空搜尋欄位
        clearSearch() {
            this.searchFilter = ''
        },
        //在左側nav選取到某角色時顯示該角色icon
        showIcon(item) {
            this.isSelectIcon = true
            this.selectIcon = 'src/img/UI_Card_S/UI_Card_'+ item.imgName +'_S.png'
        },
        hideIcon() {
            this.isSelectIcon = false
            this.selectIcon = ''
        },
        setSpine() {
            const node = document.getElementById("spineViewer");
            node.innerHTML = '';
            const charName = this.char.atlasName ? this.char.atlasName : "Alice";
            this.player = new spine.SpinePlayer("spineViewer", {
                jsonUrl: "src/spine/Fullbody_Hero_" + charName + this.skin + ".json",
                atlasUrl: "src/spine/Fullbody_Hero_" + charName + this.skin + ".atlas",
                backgroundColor: "#00000000",
                defaultMix: 0,
                showControls: false,
                premultipliedAlpha: true,
                alpha: true,
                viewport: {
                    debugRender: false,
                    transitionTime: 1,
                    // x: -800,
                    // y: 400,
                    // width: 1400,
                    // height: 1400 // -800, 0, 1600, 1600
                    // padTop: "100%",
                    // padBottom: "100%",
                    // padRight: "5%",
                    // padLeft: "5%"
                }
            })
        }
    },
    computed: {
        //篩選左側nav角色
        charsFilter() {
            const newData = this.allChars.filter(item => {
                if (this.searchFilter) {
                    this.classFilter = 'Class'
                    this.elementFilter = 'Element'
                    return item.name.toLowerCase().includes(this.searchFilter.toLowerCase())
                }
                if (this.elementFilter === 'Element') {
                    if (this.classFilter === 'Class') {
                        return this.allChars
                    }else {
                        return item.class === this.classFilter
                    }
                }else {
                    if (this.classFilter === 'Class') {
                        return item.element === this.elementFilter
                    }else {
                        return item.class === this.classFilter & item.element === this.elementFilter
                    }
                }
            })

            return newData
        },
        atk() {
            return Math.floor(this.char.atk * (1 + 0.15 * (this.level - 1)))
        },
        def() {
            return Math.floor(this.char.def * (1 + 0.15 * (this.level - 1)))
        },
        hp() {
            return Math.floor(this.char.hp * (1 + 0.15 * (this.level - 1)))
        }

    },
    //初始化
    mounted() {
        this.setDefault()
        this.setSpine()
    }
});
app.mount('#app');