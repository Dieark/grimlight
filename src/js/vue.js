import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.40/vue.esm-browser.min.js'

const app = createApp({
    created(){
        this.isMobile()
    },
    data() {
        return {
            allChars:[],
            char:{},
            unitData:{},
            unitStatData:{},
            DamageType:0,
            classType:['Guardian', 'Mage', 'Sage', 'Assassin', 'Ranger', 'Warrior'],
            elementType:['Nature', 'Water', 'Fire', 'Light', 'Dark'],
            damageType:['Physical', 'Magic'],
            skinAssetNames:[],

            baseATK:0,
            baseHP:0,
            baseDEF:0,
            activeCooldown:0,

            level:70,
            
            isNav:true && !this.isMobile,
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
            nameTrait4:'',
            descriptionActive:'',
            descriptionPassive1:'',
            descriptionTrait1:'',
            descriptionTrait2:'',
            descriptionTrait3:'',
            descriptionTrait4:'',
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
        isMobile() {
            if (screen.width <= 768) {
              return true
            } else {
              return false
            }
        },
        setDefault() {
            // 取得所有角色
            axios.get('src/json/char.json')
              .then((res) => {
                this.allChars = res.data
                this.char = this.allChars[0] // 預設Alice
                this.showChar(this.char)
              })
        },
        //中間主畫面取得某一角色
        showChar(item) {
            // 重設
            this.level = 70
            this.skillLevel = 5
            this.char = this.allChars[this.allChars.findIndex(obj => obj.displayName === item.displayName)]
            this.ui_card_path = 'src/img/UI_Card_S/UI_Card_' + this.char.imgName +'_S.png'
            this.skin = this.char.skin0
            axios.get('src/json/' + this.char.unitData)
              .then((response) => {
                console.log(response)
                this.unitData = response.data.unitData
                this.unitStatData = response.data.unitStatData
                this.DamageType = response.data.unitStatData.attackDamage.DamageType
                this.baseATK = response.data.unitStatData.attackDamage.damageScaling.yIntercept
                this.baseDEF = response.data.unitStatData.defense.yIntercept
                this.baseHP = response.data.unitStatData.hp.yIntercept
              })
            axios.get('src/json/' + this.char.skillActive)
              .then((response) => {
                console.log(response)
                this.activeCooldown = response.data.cooldown
                console.log(this.activeCooldown)
              })
            // 取得小圖與spine動畫
            // axios.get('src/json/char.json')
            //   .then((res) => {
            //     console.log(res)
            //     const index = this.allChars.findIndex(obj => obj.displayName === item.displayName)
            //     this.char = res.data[index]
            //     this.ui_card_path = 'src/img/UI_Card_S/UI_Card_' + this.char.imgName +'_S.png'

            //     axios.get('src/json/' + this.char.unitData)
            //       .then((response) => {
            //         console.log(response)

            //       })
            //     // this.setSpine()
            //   })

            // 取得技能資訊
            axios.get('src/json/LanguageSource_Ability.json')
              .then((res) => {
                console.log('char:', this.char)
                this.nameActive = this.skillProcess1(res, this.char.srcName, this.nameActive, 'Names/Ability_', '_Active')
                this.namePassive1 = this.skillProcess1(res, this.char.srcName, this.namePassive1, 'Names/Ability_', '_Passive1')
                this.nameTrait1 = this.skillProcess1(res, this.char.srcName, this.nameTrait1, 'Names/Ability_', '_Trait1')
                this.nameTrait2 = this.skillProcess1(res, this.char.srcName, this.nameTrait2, 'Names/Ability_', '_Trait2')
                this.nameTrait3 = this.skillProcess1(res, this.char.srcName, this.nameTrait3, 'Names/Ability_', '_Trait3')
                this.nameTrait4 = this.skillProcess1(res, this.char.srcName, this.nameTrait4, 'Names/Ability_', '_Trait4')
                this.descriptionActive = this.skillProcess1(res, this.char.srcName, this.descriptionActive, 'Description/Ability_', '_Active')
                this.descriptionPassive1 = this.skillProcess1(res, this.char.srcName, this.descriptionPassive1, 'Description/Ability_', '_Passive1')
                this.descriptionTrait1 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait1, 'Description/Ability_', '_Trait1')
                this.descriptionTrait2 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait2, 'Description/Ability_', '_Trait2')
                this.descriptionTrait3 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait3, 'Description/Ability_', '_Trait3')
                this.descriptionTrait4 = this.skillProcess1(res, this.char.srcName, this.descriptionTrait4, 'Description/Ability_', '_Trait4')
                this.skillProcess2(this.descriptionActive, this.processedActive)
                this.skillProcess2(this.descriptionPassive1, this.processedPassive)
                console.log('active: ', this.nameActive, ': ', this.descriptionActive)
                console.log('passive: ', this.namePassive1, ': ', this.descriptionPassive1)
              })
        },
        skillProcess1(res, srcName, p, q, r) {
            p = res.data.mSource.mTerms.filter(item => item.Term.includes(q + srcName + r))[0]
            p = typeof(p) != 'undefined' ? p.Languages[0] : ''
            return p
        },
        skillProcess2(p, q) {
            q.part2 = ''
            q.part3 = ''
            q.part4 = ''
            var index = Math.min(...[p.indexOf('<color'), p.indexOf('['), p.indexOf('+')].filter(num => num > 0))
            if (index === p.indexOf('<color') || (index === p.indexOf('+') && p.indexOf('<color') > 0)) {
                q.part1 = p.slice(0, p.indexOf('<color'))
                q.part2 = p.slice(p.indexOf('</color>') + 8, p.length)
                q.color1 = 'color: ' + p.slice(p.indexOf('<color') + 7, p.indexOf('>')) + ';'
                q.value1 = this.skillValueProcess(p)
            }
            if (index === p.indexOf('[')) {
                q.part1 = p.slice(0, p.indexOf('['))
                q.part2 = p.slice(p.indexOf(']') + 1, p.length)
                q.color1 = 'color: currentColor;'
                q.value1 = this.skillValueProcess(p)
            }
            if (index === p.indexOf('+') && p.indexOf('[') - p.indexOf('+') === 1) {
                q.part1 = p.slice(0, p.indexOf('+'))
                q.part2 = p.slice(p.indexOf(']') + 1, p.length)
                q.color1 = 'color: currentColor;'
                q.value1 = this.skillValueProcess(p)
            }
            if (p.indexOf('%') - p.indexOf(']') === 1) {
                q.part2 = q.part2.replace('%', '')
            }
            if (q.part2.indexOf('<color') || q.part2.indexOf('[') || q.part2.indexOf('+')) {
                p = q.part2
                var index2 = Math.min(...[p.indexOf('<color'), p.indexOf('['), p.indexOf('+')].filter(num => num > 0))
                if (index2 === p.indexOf('<color') || (index2 === p.indexOf('+') && p.indexOf('<color') > 0)) {
                    q.part2 = p.slice(0, p.indexOf('<color'))
                    q.part3 = p.slice(p.indexOf('</color>') + 8, p.length)
                    q.color2 = 'color: ' + p.slice(p.indexOf('<color') + 7, p.indexOf('>')) + ';'
                    q.value2 = this.skillValueProcess(p)
                }
                if (index2 === p.indexOf('[')) {
                    q.part2 = p.slice(0, p.indexOf('['))
                    q.part3 = p.slice(p.indexOf(']') + 1, p.length)
                    q.color2 = 'color: currentColor;'
                    q.value2 = this.skillValueProcess(p)
                }
                if (index2 === p.indexOf('+') && p.indexOf('[') - p.indexOf('+') === 1) {
                    q.part2 = p.slice(0, p.indexOf('+'))
                    q.part3 = p.slice(p.indexOf(']') + 1, p.length)
                    q.color2 = 'color: currentColor;'
                    q.value2 = this.skillValueProcess(p)
                }
                if (p.indexOf('%') - p.indexOf(']') === 1) {
                    q.part3 = q.part3.replace('%', '')
                }
            }else {
                q.part3 = ''
            }
            if (q.part3.indexOf('<color') || q.part3.indexOf('[') || q.part3.indexOf('+')) {
                p = q.part3
                var index3 = Math.min(...[p.indexOf('<color'), p.indexOf('['), p.indexOf('+')].filter(num => num > 0))
                if (index3 === p.indexOf('<color') || (index3 === p.indexOf('+') && p.indexOf('<color') > 0)) {
                    q.part3 = p.slice(0, p.indexOf('<color'))
                    q.part4 = p.slice(p.indexOf('</color>') + 8, p.length)
                    q.color3 = 'color: ' + p.slice(p.indexOf('<color') + 7, p.indexOf('>')) + ';'
                    q.value3 = this.skillValueProcess(p)
                }
                if (index3 === p.indexOf('[')) {
                    q.part3 = p.slice(0, p.indexOf('['))
                    q.part4 = p.slice(p.indexOf(']') + 1, p.length)
                    q.color3 = 'color: currentColor;'
                    q.value3 = this.skillValueProcess(p)
                }
                if (index3 === p.indexOf('+') && p.indexOf('[') - p.indexOf('+') === 1) {
                    q.part3 = p.slice(0, p.indexOf('+'))
                    q.part4 = p.slice(p.indexOf(']') + 1, p.length)
                    q.color3 = 'color: currentColor;'
                    q.value3 = this.skillValueProcess(p)
                }
                if (p.indexOf('%') - p.indexOf(']') === 1) {
                    q.part4 = q.part4.replace('%', '')
                }
            }else {
                q.part4 = ''
            }
            console.log(q)
        },
        skillValueProcess(p) {
            var index = Math.min(...[p.indexOf('*'), p.indexOf('+')].filter(num => num > 0))
            if (index === p.indexOf('*')) {
                var operator = p.indexOf('*')
                var multiValue = parseInt(p.slice(p.indexOf('[') + 1, operator)) * (parseFloat(p.slice(operator + 1, p.indexOf(']'))) ** (this.skillLevel - 1))
                    return String(Math.round( ( multiValue + Number.EPSILON ) * 100 ) / 100) + '%'
            }
            if (index === p.indexOf('+')) {
                var operator = p.indexOf('+') > p.indexOf('[') ? p.indexOf('+') : Math.min(...[p.slice(p.indexOf('+') + 1, p.length).indexOf('+'), p.slice(p.indexOf('+') + 1, p.length).indexOf('*')].filter(num => num > 0)) + p.indexOf('+') + 1
                var multiValue = parseInt(p.slice(p.indexOf('[') + 1, operator)) + (parseInt(p.slice(operator + 1, p.indexOf(']'))) * (this.skillLevel - 1))
                console.log(p.slice(p.indexOf('[') + 1, operator))
                    return String(Math.round( ( multiValue + Number.EPSILON ) * 100 ) / 100) + '%'
            }
            return String(p.slice(p.indexOf('>') + 1, p.indexOf('</color>')))
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
        // 設定spine
        setSpine() {
            const node = document.getElementById("spineViewer");
            node.innerHTML = '';
            // const charName = this.char.atlasName ? this.char.atlasName : "Alice";
            this.player = new spine.SpinePlayer("spineViewer", {
                jsonUrl: 'src/spine/' + this.skin + ".json",
                atlasUrl: 'src/spine/' + this.skin + ".atlas",
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
                    return item.displayName.toLowerCase().includes(this.searchFilter.toLowerCase())
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
            return Math.floor(this.baseATK * (1 + 0.15 * (this.level - 1)))
        },
        def() {
            return Math.floor(this.baseDEF * (1 + 0.15 * (this.level - 1)))
        },
        hp() {
            return Math.floor(this.baseHP * (1 + 0.15 * (this.level - 1)))
        }

    },
    //初始化
    mounted() {
        this.setDefault()
        // this.setSpine()
        
    }
});
app.mount('#app');