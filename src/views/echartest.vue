<template>
  <div class="charts">
    <el-row :gutter="20" style="width: 100%;height: 100%">
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <div style="height:5vh"></div>
          <div ref="chartOne" style="height: 30vh;border: 2px solid #f9f9fa;padding-top:15px ;border-radius: 20px;" v-loading="isLoading"></div>
          <div style="height:5vh"></div>
          <div ref="chartTwo" style="height: 43vh;border: 2px solid #f9f9fa;padding-top:15px ;border-radius: 20px;" v-loading="isLoading"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <div style="height: 30vh">
            <p class="font-my">上次更新时间</p>
            <p class="font-my">{{ lastTime }}</p>
            <p class="font-my">当前时间:{{ nowTime }}</p>
          </div>
          <el-button type="success" @click="getSd">刷新数据</el-button>
          <el-button type="info" @click="setEcs(0)">现存确诊</el-button>
          <el-button type="info" @click="setEcs(1)">总确诊</el-button>
          <el-button type="info" @click="setEcs(2)">新增确诊</el-button>
          <el-button type="info" @click="exportExcel">导出数据</el-button>
          <div ref="chartMap" style="width: 100%;height: 50vh;border: 2px solid #f9f9fa;border-radius: 20px" v-loading="isLoading">
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="grid-content bg-purple">
          <div style="height:5vh"></div>
          <div ref="chartThree" style="height:30vh;border: 2px solid #f9f9fa;padding-top:15px ;border-radius: 20px;" v-loading="isLoading"></div>
          <div style="height:5vh"></div>
          <div ref="chartFour" style="height:45vh;border: 2px solid #f9f9fa;border-radius: 5px;">
            <el-table
                    id="out-table"
                    v-loading="isLoading"
                    height="45vh"
                    :data="tables"
                    style="width: 100%"
                    :default-sort = "{prop: 'total.nowConfirm', order: 'descending'}"
            >
              <el-table-column
                      prop="sf"
                      label="省份"
                      sortable
                      width="80">
              </el-table-column>
              <el-table-column
                      prop="name"
                      label="城市"
                      sortable
                      width="150">
              </el-table-column>
              <el-table-column
                      prop="today.confirm"
                      label="新增"
                      sortable
                      width="100">
              </el-table-column>
              <el-table-column
                      prop="total.nowConfirm"
                      label="现存"
                      width="100"
                      sortable>
              </el-table-column>
              <el-table-column
                      prop="total.grade"
                      label="区域风险"
                      width="120"
                      sortable>
              </el-table-column>
              <el-table-column
                      prop="total.confirm"
                      label="总确诊"
                      width="100"
                      sortable>
              </el-table-column>
              <el-table-column
                      prop="total.heal"
                      label="治愈"
                      width="100"
                      sortable>
              </el-table-column>
              <el-table-column
                      prop="total.dead"
                      label="死亡"
                      width="100"
                      sortable>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
import echarts from "echarts";
import china from "echarts/map/json/china.json";
// import lodash from 'lodash'
import axios from "axios";
export default {
  name: "echartest",
  data() {
    return {
      nowTime:"",
      txdata:[],
      heal: 0,
      dead: 0,
      chinaTotal: 0,
      chinaAdd: 0,
      chinaNow: 0,
      datas: [],
      lastTime: "",
      check: 0,
      isLoading: false,
      isChina: false,
      timer:"",
      tables:[]
    };
  },
  mounted() {
    this.getSd();
    let vm = this;
    this.timer = setInterval(function () {
      vm.getDates();
    },1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    setChartTwo(){
      let datas = this.txdata.slice(-7);
      let dates = [];
      let confirm = [];
      datas.forEach(item=>{
        dates.push(item.date)
        confirm.push(item.confirm);
      })
      console.log(dates)
      let option = {
        title: {
          text: '新增速率',
          subtext: '来源自腾讯疫情网',
          left: 'center',
          textStyle:{
            color:'black'
          },
          subtextStyle:{
            color:'black'
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            color: "black" //刻度线标签颜色
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: "black" //刻度线标签颜色
          }
        },
        series: [{
          data: confirm,
          label:{
            show: true,
            color:"black"
          },
          type: 'line',
          areaStyle: {}
        }]
      };

      let myChart = echarts.init(this.$refs.chartTwo);
      myChart.setOption(option);
    },
    setChartOne(){
      let city = [];
      let adds = [];
      let now = [];
      // let sum = [];
      // let heal = [];
      // let dead = [];
      for(let i=0;i<7;i++){
        let datas = this.datas[i];
        city.unshift(datas.name);
        adds.unshift(datas.today.confirm);
        now.unshift(datas.total.nowConfirm);
        // sum.unshift(datas.total.confirm);
        // heal.unshift(datas.total.heal);
        // dead.unshift(datas.total.dead);
      }

      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          // ['新增', '现存', '累计确诊', '累计治愈', '死亡']
          data: ['新增', '现存'],
          textStyle:{
            color:"black"
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
          textStyle:{
            color:"black"
          }
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: "black" //刻度线标签颜色
          }
        },
        yAxis: {
          type: "category",
          data: city,
          axisLabel: {
            color: "black" //刻度线标签颜色
          }
        },
        series: [
          {
            name: '新增',
            type: 'bar',
            stack: '总量',
            textStyle:{
              color:"black"
            },
            label: {
              textStyle:{
                color:"black"
              },
              show: true,
              position: 'insideRight'
            },
            data: adds
          },
          {
            name: '现存',
            type: 'bar',
            stack: '总量',
            label: {
              show: true,
              position: 'insideRight'
            },
            data: now
          }
          // {
          //   name: '累计确诊',
          //   type: 'bar',
          //   stack: '总量',
          //   label: {
          //     show: true,
          //     position: 'insideRight'
          //   },
          //   data: sum
          // },
          // {
          //   name: '累计治愈',
          //   type: 'bar',
          //   stack: '总量',
          //   label: {
          //     show: true,
          //     position: 'insideRight'
          //   },
          //   data: heal
          // },
          // {
          //   name: '死亡',
          //   type: 'bar',
          //   stack: '总量',
          //   label: {
          //     show: true,
          //     position: 'insideRight'
          //   },
          //   data: dead
          // }
        ]
      };
      let myChart = echarts.init(this.$refs.chartOne);
      myChart.setOption(option);
    },
    getDates(){
      let myDate = new Date();
      let year = myDate.getFullYear();
      let month = myDate.getMonth()+1;
      let day = myDate.getDate();
      let hour = myDate.getHours();
      let min = myDate.getMinutes();
      let s = myDate.getSeconds();
      if(month<10){month="0"+month};
      if(day<10){day="0"+day};
      if(hour<10){hour="0"+hour};
      if(min<10){min="0"+min};
      if(s<10){s="0"+s};
      this.nowTime = year+"-"+month+"-"+day+" "+hour+":"+min+":"+s;
    },
    getTx(){
      return new Promise(resolve => {
        axios.post('ans').then(res=>{
          console.log(res.data.data.chinaDayAddList);
          resolve(res.data.data.chinaDayAddList);
        })
      })
    },
    getSd() {
      //全国疫情数据获取
      this.isLoading = true;
      axios.post(`/api/getDisease.html`).then(res => {
        let data = JSON.parse(res.data.data);
        console.log(data);
        let dss = data.areaTree[0].children;
        this.datas = dss;
        console.log(data)
        this.chinaTotal = data.chinaTotal.confirm;
        this.chinaAdd = data.chinaAdd.confirm;
        this.chinaNow = data.chinaTotal.nowConfirm;
        this.heal = data.chinaTotal.heal;
        this.dead = data.chinaTotal.dead;
        this.lastTime = data.lastUpdateTime;
        this.isLoading = false;
        let vm = this;
        this.getTx().then(ress=>{
          vm.txdata = ress;
          this.setChartTwo();
        })
        this.setEcs(this.check);
        let citys = [];
        dss.forEach(item=>{
          item.children.forEach((items,index)=>{
            if(items.name =="境外输入"){
              item.children[index].name = item.name+items.name;
            }
            if(items.name =="地区待确认"){
              item.children[index].name = items.name+"("+item.name+")";
            }
            item.children[index].sf = item.name;
          })
          citys= citys.concat(item.children);
        });
        console.log(citys);
        this.tables = citys;
        this.setChartThree();
        this.setChartOne();
      });
    },
    exportExcel() {
      /* out-table关联导出的dom节点  */
      let wb = XLSX.utils.table_to_book(document.querySelector("#out-table"));
      /* get binary string as output */
      let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      try {
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '疫情数据.xlsx')
      } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
      return wbout
    },
    setChartThree(){
      let datas = [{value:this.chinaAdd,name:"新增"},{value:this.chinaNow,name:"现存"},{value:this.dead,name:"累计死亡"},{value:this.heal,name:"累计治愈"},{value:this.chinaTotal,name:"累计确诊"}]
      let names = ["新增","现存","累计死亡","累计治愈","累计确诊"];
      let option = {
        title: {
          text: '疫情数据',
          subtext: '来自疫情网',
          left: 'center',
          textStyle:{
            color:'black'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          type: "scroll",
          orient: 'vertical',
          textStyle:{
            color:'black'
          },
          right: 10,
          top: 20,
          bottom: 20,
          data: names,
        },
        series: [
          {
            name: '数据',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            data: datas,
            itemStyle:{
              normal:{
                label:{
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine :{show:true}
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      let myChart = echarts.init(this.$refs.chartThree);
      myChart.setOption(option);
    },
    setEcs(check) {
      //国内疫情地图绘制
      let min = 0;
      let max = 100;
      let title = " 地图";
      let data = [];
      let names = [];
      let values = [];
      this.check = check;
      if (check === 0) {
        title = "国内现存确诊地图";
        this.datas.forEach((item, index) => {
          names.push(item.name);
          values.push(item.total.confirm - item.total.dead - item.total.heal);
          data.push({ name: names[index], value: values[index] });
        });
        min = 0;
        max = 100;
      }
      if (check === 1) {
        title = "国内总确诊地图";
        this.datas.forEach((item, index) => {
          names.push(item.name);
          values.push(item.total.confirm);
          data.push({ name: names[index], value: values[index] });
        });
        min = 0;
        max = 3000;
      }
      if (check === 2) {
        title = "国内新增确诊地图";
        this.datas.forEach((item, index) => {
          names.push(item.name);
          values.push(item.today.confirm);
          data.push({ name: names[index], value: values[index] });
        });
        min = 0;
        max = 5;
      }
      echarts.registerMap("china", china);
      let myChart = echarts.init(this.$refs.chartMap);
      myChart.clear();
      let option = {
        title: {
          text: title,
          left: "center"
        },
        tooltip: {
          trigger: "item",
          showDelay: 0,
          transitionDuration: 0.2
        },
        visualMap: {
          left: "right",
          min: min,
          max: max,
          inRange: {
            //颜色梯度
            color: [
              "#f9f9fa",
              // "#bfbfc0",
              // "#74add1",
              // "#abd9e9",
              // "#e0f3f8",
              // "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026"
            ]
          },
          text: ["High", "Low"], // 文本，默认为数值文本
          calculable: true
        },
        toolbox: {
          show: true,
          //orient: 'vertical',
          left: "left",
          top: "top",
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        series: [
          {
            name: "数据",
            type: "map",
            roam: true,
            map: "china",
            emphasis: {
              label: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                label: {
                  show: true
                }
              }
            },
            // 文本位置修正

            data: data
          }
        ]
      };
      myChart.setOption(option);
      this.isChina = true;
      myChart.on("click", function(params) {
        console.log(params);
      });
    }
  }
};
</script>

<style scoped>
  .font-my {
    font-size: 40px;font-weight: bolder;-webkit-text-stroke:2px #000000;color: transparent;
    /*color: white;*/
    /*-webkit-text-stroke: 2px #000;*/
    /*font-size: 36px;*/
    /*font-weight: 800;*/
    /*padding: 18px;*/
    /*!*text-shadow: 4px 4px black, -4px -4px black,*!*/
    /*!*4px -4px black, -4px 4px black;	 }*!*/
  }
.charts {
  width: 100%;
  height: 100%;
  /*background-image: url("/1.jpg");*/
  /*background-size: cover;*/
  background-image: linear-gradient(
    #0d1e35,
    #37678d,
    #63ade0,
    #37678d,
    #18304a
  );
}
.el-row {
  margin-bottom: 0px;
&:last-child {
   margin-bottom: 0;
 }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 90vh;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
