<template>
  <nut-picker
      :is-visible="isVisible"
      :title="title"
      :list-data="listData"
      :default-value-data="defaultValueData"
      @close="switchPicker('isVisible')"
      @confirm="setChooseValue"
      @choose="updateChooseValue"
      @close-update="closeUpdateChooseValue"
  >
  </nut-picker>
</template>

<script>
import Utils from "@/utils/nutDay"
import '@/assets/css/untUI.scss';
import nutpicker from "@nutui/nutui/dist/packages/picker/picker";
import locale from "@/mixin/CustomerComponent/index";

export default {
  name: "JYSB_Mobile_CustomerNutDatePicker",

  mixins: [locale],

  props: {
    type: {type: String, default: 'date'},  // 类型，默认为date-日期， 有datetime-日期时间， time-时间， 添加了year-month 后续继续改进

    year: {type: String, default: null},  // 年份设置，仅用于月-日类型的日期设置

    isSetSecond: {type: Boolean, default: false},  // 是否设置秒
    isVisible: {type: Boolean, default: true},  // 可见状态， 默认开启
    isUse12Hours: {type: Boolean, default: false},  // 是否使用12小时计时方法， 默认关闭，使用24小时计时方法
    isAm: {type: Boolean, default: true},  // 是否采用英文计时方法，也即上午am， 下午pm， 默认开启
    minuteStep: {type: Number, default: 1},  // 分钟跳动间隔， 默认为1
    secondStep: {type: Number, default: 1},  // 秒钟跳动间隔， 默认为1
    isShowChinese: {type: Boolean, default: true},  // 是否展示中文（也即时间后面的单位，开启展示为2024年， 关闭为2024）
    title: {type: String, default: null},  // 标题
    defaultValue: {type: String, default: null},  // 默认选择的时间，也即一开始的时间
    startDate: {type: String, default: '2000-01-01'},  // 时间范围开始时间
    endDate: {type: String, default: Utils.date2Str(new Date())},  // 时间范围结束时间
    startHour: {type: Number | String, default: 0},  // 时间范围开始时间（time和datetime专用）
    endHour: {type: Number | String, default: 23},  // 时间范围结束时间（time和datetime专用）
  },

  components: {
    nutpicker
  },

  data() {
    return {
      listData: [],  // 时间数据，适用于不同的picker
      defaultValueData: null,  // 默认事件，用于设置，一般由用户自定义或自行选择
      startDateArr: null,  // 开始时间的数组形式
      endDateArr: null,  // 结束时间的数组形式
      startYear: null,  // 开始时间的年份
      endYear: null,  // 结束时间的年份
      cacheDefaultData: [],  // 缓存时间，如果存在默认时间，则缓存时间为默认事件，如果不存在默认事件，测缓存时间为现在， 数组形式
      cacheListData: [],  // 缓存时间数据， 暂时性时间数据
      updateYear: null,  //
      updateMonth: null,  //
      updateDay: null,  //
      updateHour: null,  //
      use12Hours: [],  //
      chinese: []  //
    };
  },

  computed: {
    // 如果没有默认值，则自行设置默认值
    dateRange() {
      const { startDate, endDate, defaultValue } = this;
      return { startDate, endDate, defaultValue };
    }
  },

  watch: {
    //
    dateRange(newValue, oldValue) {
      this.init();
    }
  },

  created() {
    // 初始化
    this.init();
  },

  methods: {

    /**
     * init()
     * initListData()
     *      resetDefaultValue()
     *          getCacheData()
     *
     */

    /**
     * 开始时间，默认时间，结束时间检验，没有则设置为默认时间， 并进行数据的数组化
     */
    init() {
      //  如果自定义了开始时间，则开始时间变更为自定义的开始时间数组
      //  匹配接收到的数据， 目前可以匹配YYYY-MM,YYYY-MM-DD YYYY-MM-DD hh:mm\ YYYY-MM-DD hh:mm:ss\ hh:mm\ hh:mm:ss
      if (this.startDate && Utils.isDateString(this.startDate)) {
        this.startDateArr = Utils.getDateArr(this.startDate);
      }
      // 没有自定义，则定义为2000年
      else {
        this.startDateArr = Utils.getDateArr('2000-01-01');
      }

      // 如果有自定义结束时间，则结束时间变为自定义结束时间
      if (this.endDate && Utils.isDateString(this.endDate)) {
        this.endDateArr = Utils.getDateArr(this.endDate);
      }
      // 如果没有自定义结束时间，则把结束时间定义为现在
      else {
        this.endDateArr = Utils.date2Str(new Date());
      }

      // 结束时间小于开始时间，结束时间重置为开始时间
      if (Utils.compareDateArr(this.endDateArr, this.startDateArr)) {
        this.endDateArr = this.startDateArr;
      }

      {
        // 国际化
        let year = this.nutTranslate('lang.calendar.year');
        let month = this.nutTranslate('lang.calendar.month');
        let day = this.nutTranslate('lang.calendar.day');
        let hour = this.nutTranslate('lang.calendar.hour');
        let minute = this.nutTranslate('lang.calendar.minute');
        let second = this.nutTranslate('lang.calendar.second');
        let morning = this.nutTranslate('lang.calendar.morning');
        let afternoon = this.nutTranslate('lang.calendar.afternoon');
        (this.use12Hours = [morning, afternoon]),
            (this.chinese = !this.isShowChinese
                ? new Array(6).fill('')
                : this.type === 'time'
                    ? this.isUse12Hours
                        ? [hour, minute, '']
                        : [hour, minute, second]
                    : [year, month, day, hour, minute]),
            this.initListData();
      }
    },

    /**
     * 初始化时间数据， 得到时间数据数列
     */
    initListData() {
      // 重置默认时间
      this.resetDefaultValue();
      // 根据类型，获取时间Array
      switch (this.type) {
        // 年-月-日
        case 'date': {
          this.cacheListData = [
            ...[this.getYears(), this.getMonths(this.defaultValueData[0]), this.getDays(this.defaultValueData[0], this.defaultValueData[1])]
          ];
          break;
        }
        // 年-月-日
        case 'year-month-day': {
          this.cacheListData = [
            ...[this.getYears(), this.getMonths(this.defaultValueData[0]), this.getDays(this.defaultValueData[0], this.defaultValueData[1])]
          ];
          break;
        }
        // 年-月
        case 'year-month': {
          this.cacheListData = [
            ...[this.getYears(), this.getMonths(this.defaultValueData[0])]
          ]
          break;
        }
        // 月-日
        case 'month-day': {
          // 获取当前年份，如果用户设置了默认的年份数值，则以用户的年份数值为准, 如无设置，则以当前日期的年份为准
          this.cacheListData = [
            ...[this.getMonths(this.defaultValueData[0]), this.getDays(this.defaultValueData[0], this.defaultValueData[1])]
          ]
          break
        }

        // 年
        case 'year': {
          this.cacheListData = [
              ...[this.getYears()]
          ]
          break
        }

        // 年-月-日-时-分
        case 'datetime': {
          this.cacheListData = [
            ...[
              this.getYears(),
              this.getMonths(this.defaultValueData[0]),
              this.getDays(this.defaultValueData[0], this.defaultValueData[1]),
              this.getChangeHours(this.defaultValueData[0], this.defaultValueData[1], this.defaultValueData[2]),
              this.getChangeMinutes(this.defaultValueData[0], this.defaultValueData[1], this.defaultValueData[2], this.defaultValueData[3])
            ]
          ];
          break;
        }
        // 月-日-时-分
        case 'month-day-hour-minute': {
          this.cacheListData = [
            ...[
              this.getMonths(this.defaultValueData[0]),
              this.getDays(this.defaultValueData[0], this.defaultValueData[1]),
              this.getChangeHours(this.defaultValueData[0], this.defaultValueData[1], this.defaultValueData[2]),
              this.getChangeMinutes(this.defaultValueData[0], this.defaultValueData[1], this.defaultValueData[2], this.defaultValueData[3])
            ]
          ];
          break;
        }
        // 日-时-分
        case 'day-hour-minute': {
          break
        }
        // 时-分
        case 'hour-minute': {
          this.cacheListData = [...[this.getHours(), this.getMinutes()]];
          if (this.isUse12Hours) {
            this.cacheListData = [...this.cacheListData, this.use12Hours];
          } else {
            this.cacheListData = this.isSetSecond ? [...this.cacheListData, this.getSeconds()] : [...this.cacheListData];
          }
          break
        }
        // 时-分
        case 'time': {
          this.cacheListData = [...[this.getHours(), this.getMinutes()]];
          if (this.isUse12Hours) {
            this.cacheListData = [...this.cacheListData, this.use12Hours];
          } else {
            this.cacheListData = this.isSetSecond ? [...this.cacheListData, this.getSeconds()] : [...this.cacheListData];
          }
          break;
        }

      }
      // 将缓存得到的时间数据Array解构赋值
      this.listData = [...this.cacheListData];
    },

    /**
     * 重置默认时间， 得到defaultValueDate
     */
    resetDefaultValue() {
      // 缓存默认时间
      let cacheDefaultValue = null;
      // 如果默认设置的时间不存在
      if (!this.defaultValue || !Utils.isDateString(this.defaultValue)) {
        // 根据选择的类型来进行默认时间的设置
        switch (this.type) {
          // 如果是时间，如果有设置秒，则
          case 'time':
            cacheDefaultValue = this.isSetSecond ? `00:00:00` : `00:00`;
            break;
          //  如果为日期或者日期时间，则设置为
          case 'date':
          case 'datetime':
            cacheDefaultValue = `${this.startDateArr[0]}-${this.startDateArr[1]}-${this.startDateArr[2]} ${this.startDateArr[3]}:${this.startDateArr[4]}`;
            break;
        }
      }
      // 存在默认时间，将缓存时间的值设置为默认时间的值
      else {
        cacheDefaultValue = this.defaultValue;
      }
      // 将缓存时间根据 （空格） 进行拆分，分为数列， date下为2024-01-01 datetime为2024-01-01 00:00
      let splitArr = cacheDefaultValue.split(' ');
      // 根据类型进行操作
      switch (this.type) {
        case 'time': {
          let timeArr = splitArr[0].split(':');
          this.isUse12Hours && timeArr.push(this.isAm ? this.use12Hours[0] : this.use12Hours[1]);
          this.cacheDefaultData = this.getCacheData(timeArr);
          break;
        }

        case 'year': {
          let cacheData = [...splitArr[0].replace(/-/g, '/').split('/')];
          this.cacheDefaultData = this.getCacheData(cacheData);
          this.updateYear = this.cacheDefaultData[0];
          break
        }

        case 'year-month': {
          let cacheData = [...splitArr[0].replace(/-/g, '/').split('/')];
          this.cacheDefaultData = this.getCacheData(cacheData);
          this.updateYear = this.cacheDefaultData[0];
          this.updateMonth = this.cacheDefaultData[1];
          break
        }

        case 'month-day': {
          let cacheYear = this.year? this.year: String(new Date().getFullYear())
          splitArr[0] = cacheYear + '-' + splitArr[0]
          let cacheDate = [...splitArr[0].replace(/-/g, '/').split('/')]
          this.cacheDefaultData = this.getCacheData(cacheDate)
          break
        }

        case 'datetime':
        case 'date': {
          let cacheData = [...splitArr[0].replace(/-/g, '/').split('/')];
          if (this.type === 'datetime') {
            cacheData = [...cacheData, ...splitArr[1].split(':')];
          }
          this.cacheDefaultData = this.getCacheData(cacheData);
          this.updateYear = this.cacheDefaultData[0];
          this.updateMonth = this.cacheDefaultData[1];
          this.updateDay = this.cacheDefaultData[2];
          this.updateHour = this.cacheDefaultData[3];
          break;
        }
      }

      this.defaultValueData = [...this.cacheDefaultData];
    },

    /**
     * 格式化缓存的时间数据中的时间部分
     * @param data 只有日期的时间数据数组 示例['2024', '01', '01']
     * @returns {*[]} 返回一个带中文的时间str 示例['2024年', '1月', '01日']
     */
    getCacheData(data) {
      let cacheData = [];
      data.map((item, index) => {
        item < 10 && (item = item.replace(/^0/g, ''));
        cacheData.push(`${item}${this.chinese[index]}`);
      });
      return cacheData;
    },

    /**
     * 获取年份数据
     * @returns {*[]} 一个从开始时间到结束时间的年份时间数组， 示例['2000年', '2001年', …………, '2024年']
     */
    getYears() {
      let cacheYears = [];
      for (let i = this.startDateArr[0]; i <= this.endDateArr[0]; i++) {
        cacheYears.push(`${i}${this.chinese[0]}`);
      }
      return cacheYears;
    },

    /**
     * 获取当前在选择中的年份的月份数据
     * @param year 被选择年份
     * @returns {*[]} 一个从开始时间到结束时间的年份时间数组， 示例['1月', …………, 'end月']
     */
    getMonths(year) {
      // 移除年份后面的中文年
      year = this.removeChinese(year);
      let cacheMonths = [];
      for (let i = 1; i <= 12; i++) {
        if (!(year === this.startDateArr[0] && i < this.startDateArr[1]) && !(year === this.endDateArr[0] && i > this.endDateArr[1])) {
          cacheMonths.push(`${i}${this.chinese[1]}`);
        }
      }
      return cacheMonths;
    },

    /**
     * 获取当前选择中的月份的日期数据
     * @param year 被选中年份
     * @param month 被选中月份
     * @returns {unknown[]} 返回一个日期数列
     */
    getDays(year, month) {
      year = this.removeChinese(year);
      month = this.removeChinese(month);
      let days = Array.from(Array(Utils.getMonthDays(year, month)), (v, k) => {
        if (
            !(year === this.startDateArr[0] && month === parseInt(this.startDateArr[1]) && k + 1 < parseInt(this.startDateArr[2])) &&
            !(year === this.endDateArr[0] && month === parseInt(this.endDateArr[1]) && k + 1 > parseInt(this.endDateArr[2]))
        ) {
          return `${k + 1}${this.chinese[2]}`;
        }
      });
      return days.filter(item => item);
    },
    getChangeHours(year, month, day) {
      year = this.removeChinese(year);
      month = this.removeChinese(month).padStart(2, '0');
      day = this.removeChinese(day).padStart(2, '0');
      let hours = Array.from(Array(24).keys()).map(hour => {
        let startEqualState = year === this.startDateArr[0] && month === this.startDateArr[1] && day === this.startDateArr[2];
        let endEqualState = year === this.endDateArr[0] && month === this.endDateArr[1] && day === this.endDateArr[2];
        let startHour = this.startDateArr[3],
            endHour = this.endDateArr[3];

        let resHour = undefined;
        if (startEqualState && endEqualState) {
          if (hour >= parseInt(startHour) && hour <= parseInt(endHour)) {
            resHour = hour;
          }
        } else if (startEqualState) {
          if (hour >= parseInt(startHour)) {
            resHour = hour;
          }
        } else if (endEqualState) {
          if (hour <= parseInt(endHour)) {
            resHour = hour;
          }
        } else {
          resHour = hour;
        }
        if (resHour === 0) {
          resHour = '0';
        }
        return resHour ? `${resHour}${this.chinese[3]}` : undefined;
      });
      return hours.filter(item => item);
    },
    getChangeMinutes(year, month, day, hour) {
      year = this.removeChinese(year);
      month = this.removeChinese(month).padStart(2, '0');
      day = this.removeChinese(day).padStart(2, '0');
      hour = this.removeChinese(hour).padStart(2, '0');
      let minutes = Array.from(Array(60).keys()).map(minute => {
        let startEqualState =
            year === this.startDateArr[0] && month === this.startDateArr[1] && day === this.startDateArr[2] && hour === this.startDateArr[3];
        let endEqualState = year === this.endDateArr[0] && month === this.endDateArr[1] && day === this.endDateArr[2] && hour === this.endDateArr[3];
        let startMinute = this.startDateArr[4],
            endMinute = this.endDateArr[4];

        let resMinute = undefined;
        if (startEqualState && endEqualState) {
          if (minute >= parseInt(startMinute) && minute <= parseInt(endMinute)) {
            resMinute = minute;
          }
        } else if (startEqualState) {
          if (minute >= parseInt(startMinute)) {
            resMinute = minute;
          }
        } else if (endEqualState) {
          if (minute <= parseInt(endMinute)) {
            resMinute = minute;
          }
        } else {
          resMinute = minute;
        }
        if (resMinute === 0) {
          resMinute = '0';
        }
        return resMinute % this.minuteStep === 0 ? `${resMinute}${this.chinese[4]}` : undefined;
      });
      return minutes.filter(item => item);
    },
    getHours() {
      let endHour = this.endHour;
      if (this.isUse12Hours) {
        endHour = 11;
      }
      let hours = Array.from(Array(parseInt(endHour) + 1), (v, k) => {
        if (this.isUse12Hours && k === 0) {
          k = 12;
        }
        if (k >= this.startHour) {
          return `${k}${this.type === 'time' ? this.chinese[0] : this.chinese[3]}`;
        }
      });
      return hours.filter(item => item);
    },
    getMinutes() {
      let minutes = Array.from(Array(60), (v, k) => {
        if (k === 0 || k % this.minuteStep === 0) {
          return `${k}${this.type === 'time' ? this.chinese[1] : this.chinese[4]}`;
        }
      });
      return minutes.filter(item => item);
    },
    getSeconds() {
      let seconds = Array.from(Array(60), (v, k) => {
        if (k === 0 || k % this.secondStep === 0) {
          return `${k}${this.type === 'time' ? this.chinese[2] : this.chinese[5]}`;
        }
      });
      return seconds.filter(item => item);
    },

    /**
     * 选择日期时触发， 格式化全部数据（去除单位），添加全部日期信息（去除单位），对日期类型补全自然周信息， 不对时间类型，year-month补全自然周信息
     * @param chooseData 被选择的时间，点击确认后触发
     */
    setChooseValue(chooseData) {
      // 缓存被选择的数据
      let cacheChooseData = [];
      // 补齐字数，当日期，月份，小时，秒等小于9，往前面补0
      chooseData.map((item, index) => {
        // 类型为time，且开启了12小时计时方式， 并且是
        if (this.isUse12Hours && this.type === 'time' && index === 2) {
          cacheChooseData.push(item);
        }
        //
        else {
          cacheChooseData.push(Utils.getNumTwoBit(this.removeChinese(item)));
        }
      });

      // 格式化全部信息，去除日期单位，添加全部所选日期的信息，并对拥有日期的类型补全自然周信息， 时间, year-month类型不进行补全
      switch (this.type) {
        case 'time': {
          cacheChooseData.push(`${cacheChooseData[0]}:${cacheChooseData[1]}${this.isSetSecond ? ':' + cacheChooseData[2] : ''}`);
          break
        }

        case 'year': {
          cacheChooseData.push(`${cacheChooseData[0]}`)
          break
        }

        case 'year-month': {
          cacheChooseData.push(`${cacheChooseData[0]}-${cacheChooseData[1]}`)
          break
        }

        case 'month-day': {
          cacheChooseData.push(`${cacheChooseData[0]}-${cacheChooseData[1]}`)
          break
        }

        case 'date': {
          cacheChooseData.push(`${cacheChooseData[0]}-${cacheChooseData[1]}-${cacheChooseData[2]}`);
          let week = Utils.getWhatDay(cacheChooseData[0], cacheChooseData[1], cacheChooseData[2]);
          cacheChooseData.push(week);
          break
        }
        case 'datetime': {
          cacheChooseData.push(`${cacheChooseData[0]}-${cacheChooseData[1]}-${cacheChooseData[2]} ${cacheChooseData[3]}:${cacheChooseData[4]}`);
          let week = Utils.getWhatDay(cacheChooseData[0], cacheChooseData[1], cacheChooseData[2]);
          cacheChooseData.push(week);
          break
        }
      }
      // 被选择的缓存数据传递到外部，由choose事件触发
      this.$emit('choose', cacheChooseData);

    },

    /**
     * 移除日期时间的中文单位
     * @param value
     * @returns {string}
     */
    removeChinese(value) {
      return value.toString().replace(/([^\u0000-\u00FF])/g, '');
    },

    /**
     * nut-picker 设置并更新对应的时间值
     * @param self  this, 也就是这个vc
     * @param index index指选择器的index，nut使用固定的索引，这里打算进行修改
     * @param value 正在处理的时间数据的值（被选择到的）， 字符串, 当被选到，但不进行确认，这个值为对应时间的时间值
     * @param chooseValue 一个恒定为null的值
     * @param cacheValueData 正在处理的数据的完整形式（被选择到的）
     * @returns {boolean}
     */
    updateLinkage(self, index, value, chooseValue, cacheValueData) {
      if (!value || !cacheValueData[index] || this.type === 'time') {
        return false;
      }
      // 移除中文时间单位
      value = this.removeChinese(value);
      // 设置Picker的值
      switch (index) {
        case 1: {
          // 年份设置, 更新月份值
          // 此时被选到的值（只是此时）
          this.updateYear = value;
          // 更新listData(picker可以选择的值)的月份数据的值
          this.listData.splice(index, 1, this.getMonths(value));

          // chooseValue恒定=cacheValueData[index]
          chooseValue = chooseValue ? chooseValue : cacheValueData[index];

          let curMonthsData = this.listData[index];
          // 如果当前选择的月份，不存在于当前的月份list中，则将被选择的月份转变为当前月份list的第一项
          if (curMonthsData.indexOf(chooseValue) === -1) {
            chooseValue = curMonthsData[curMonthsData.length - 1];
          }

          // 递归更新相对应的时间， 直至无法更新
          self && self.updateChooseValue(self, index, chooseValue);

          // 更新日期的值
          this.updateLinkage(self, 2, cacheValueData[index], null, cacheValueData);
          break;
        }
        case 2: {
          // 月份设置
          this.updateMonth = value;
          this.listData.splice(index, 1, this.getDays(parseInt(this.updateYear), value));
          chooseValue = chooseValue ? chooseValue : cacheValueData[index];
          let curDaysData = this.listData[index];
          if (curDaysData.indexOf(chooseValue) === -1) {
            if (curDaysData.length < 28) {
              chooseValue = curDaysData[0];
            }
            else {
              let curChooseDay = parseInt(this.removeChinese(chooseValue));
              let days = curDaysData.length;
              chooseValue = (curChooseDay > days ? days : curChooseDay) + this.chinese[2];
            }
          }

          self && self.updateChooseValue(self, index, chooseValue);
          this.updateLinkage(self, 3, cacheValueData[index], null, cacheValueData);
          break;
        }
        case 3: {
          // 日期设置
          this.updateDay = value;
          this.listData.splice(index, 1, this.getChangeHours(parseInt(this.updateYear), parseInt(this.updateMonth), value));
          chooseValue = chooseValue ? chooseValue : cacheValueData[index];
          let curHoursData = this.listData[index];
          if (curHoursData.indexOf(chooseValue) === -1) {
            chooseValue = curHoursData[0];
          }
          self && self.updateChooseValue(self, index, chooseValue);
          this.updateLinkage(self, 4, cacheValueData[index], null, cacheValueData);
          break;
        }
        case 4: {
          // hour，时刻设置
          this.updateHour = value;
          this.listData.splice(
              index,
              1,
              this.getChangeMinutes(parseInt(this.updateYear), parseInt(this.updateMonth), parseInt(this.updateDay), parseInt(this.updateHour), value)
          );
          chooseValue = chooseValue ? chooseValue : cacheValueData[index];
          let curMinuteData = this.listData[index];
          if (curMinuteData.indexOf(chooseValue) === -1) {
            chooseValue = curMinuteData[0];
          }
          self && self.updateChooseValue(self, index, chooseValue);
        }
      }
    },

    /**
     * 组件数值更新，循环调用
     * @param self
     * @param index
     * @param value
     * @param cacheValueData
     */
    updateChooseValue(self, index, value, cacheValueData) {
      switch (this.type) {
        case 'date':
        case 'year-month-day':
        case 'year-month':
        case 'year': {
          switch (index) {
            case 0:
            case 1:
            case 2:
            case 3:
              this.updateLinkage(self, index + 1, value, null, cacheValueData);
              break;
          }
          break
        }

        case 'month-day': {
          switch (index) {
            case 0:
            case 1:
              this.updateLinkage(self, index + 2, value, null, cacheValueData)
          }
          break
        }

        case 'day': {
          this.updateLinkage(self, 3, value, null, cacheValueData)
          break
        }

        case 'datetime':
        case 'month-day-hour-minute':
        case 'day-hour-minute':
        case 'hour-minute':
        case 'time': {
          switch (index) {
            case 0:
            case 1:
            case 2:
            case 3:
              this.updateLinkage(self, index + 1, value, null, cacheValueData);
              break;
            case 4:
              break;
          }
        }
      }
    },

    /**
     * 关闭时的事件
     * @param self
     * @param chooseData
     */
    closeUpdateChooseValue(self, chooseData) {
      this.updateLinkage(self, 1, chooseData[0], chooseData[1], chooseData);
    },

    /**
     * 选择后事件
     * @param param
     */
    switchPicker(param) {
      this.$emit('close');
    }
  }
}
</script>

<style>
</style>