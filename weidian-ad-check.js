const puppeteer = require('puppeteer');
const expect = require('chai').expect;
var readlineSync = require('readline-sync');


let userAgents = {
    "手Q":'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 Language/zh_CN QQ/8.1.0 webview/4 webdebugger miniprogramhtmlwebview port/53876',
    "抖音小程序":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) bytedanceide/2.0.5 Chrome/66.0.3359.181 Electron/3.1.4 Safari/537.36",
    "喜马拉雅":"Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77 iting/6.6.66 kdtunion_iting/1.0 iting(main)/6.6.66/ios_1",
    "美拍":"Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 com.meitu.mtmv/8.3.70 (iOS12.4)/lang:zh_CN",
    "微博":"mozilla/5.0 (linux; android 7.0; jmm-al10 build/honorjmm-al10; wv) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/62.0.3202.84 mobile safari/537.36 weibo (huawei-jmm-al10__weibo__9.8.0__android__android7.0)"
}
// "小程序极速下单":"http://rocker.pre.weidian.com/fastorder.html?itemID=4224525729&type=quickOrder",
let checkLinks = {
    // "极速下单":"http://rocker.pre.weidian.com/fastorder.html?itemID=4224525729&type=quickOrder",
    "有口碑联盟的商品":"http://rocker.pre.weidian.com/item.html?itemID=2660151434&spider_token=60e5",
    "带有分期金融提示条的商品":"http://rocker.pre.weidian.com/item.html?adsk=undefined&spider_token=879c&itemID=3201917627",
    "到货提醒":"http://rocker.pre.weidian.com/item.html?itemID=4219484276&wfr=c&ifr=itemdetail",
    "定时开售":"http://rocker.pre.weidian.com/item.html?itemID=4199985712",
    "有优惠提示条的商品":"http://rocker.pre.weidian.com/item.html?itemID=3999819600&wfr=c&ifr=itemdetail",
    "有本店推荐":"http://rocker.pre.weidian.com/details/?itemID=2134696336",
    "商城版店铺商详1":"http://rocker.pre.v.weidian.com/details/?itemID=4174057602",
    "商城版店铺商详2":"http://rocker.pre.v.weidian.com/details/?itemID=4065189623"
}

let appendToContext = function (mocha, content) {
    /* 将截图添加到测试报告中 */
    try {
        const test = mocha.currentTest || mocha.test;

        if (!test.context) {
            test.context = content;
        } else if (Array.isArray(test.context)) {
            test.context.push(content);
        } else {
            test.context = [test.context];
            test.context.push(content);
        }
    } catch (e) {
        console.log('error', e);
    }
};


describe('puppteer 测试case',function() {
    /* 1. 注册全局变量，以供 it/before 等用例使用 */
    let browser;
    let that;
    let page;


    before(async function(){
        browser = await puppeteer.launch({
            headless: false,   //有浏览器界面启动
            slowMo: 100,       //放慢浏览器执行速度，方便测试观察
            // executablePath:  "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
            args: [            //启动 Chrome 的参数，详见上文中的介绍
                // '–no-sandbox',
                '--window-size=1280,960',
                '--remote-debugging-port=9222'
            ],
        });
    });

    beforeEach(async function(){
        /* 2. 将this指向mocha，表示当前测试用例，以供 appendToContext 使用 */
        that = this;
    })


    for  (var userAgent in userAgents){
        for (var checkLink in checkLinks){
            (function (userAgent,checkLink){
                it(`私域去广告-${userAgent}-${checkLink}`,  async () => {
                        /* 3 开始执行测试 */
                        page = await browser.newPage();
                        let itemUrl;
                        await page.emulate(puppeteer.devices['iPhone X'])
                        await page.setUserAgent(userAgents[userAgent])
                        if(userAgent=="手Q"){
                            itemUrl = checkLinks[checkLink] + "&vc_private_domain_env=mini"
                        }else{
                            itemUrl = checkLinks[checkLink]
                        };
                        await page.goto(itemUrl);
                        let screenShotName = Date.parse(new Date()) + '.png'
                        await page.screenshot({path: `reports/${screenShotName}`},{fullPage: true})
                        appendToContext(that,screenShotName);
                        var result = readlineSync.question(`私域去广告-${userAgent}-${checkLink} ?(y/n) : `);
                        expect(result).to.be.eq("y")
                }).timeout(60000000);
            })(userAgent,checkLink)
        }
    }
    after(async function(){
        /* 5. 关闭浏览器 */
        await browser.close();
    });

    afterEach(async function(){
        /* 4. 截图，并将其添加到测试报告中 */
        let screenShotName = Date.parse(new Date()) + '.png'
        await page.screenshot({path: `reports/${screenShotName}`},{fullPage: true})
        appendToContext(this,screenShotName);
        await page.close();
    })
});