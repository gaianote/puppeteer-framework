const puppeteer = require('puppeteer');
const expect = require('chai').expect;

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
            args: [            //启动 Chrome 的参数，详见上文中的介绍
                '–no-sandbox',
                '--window-size=1280,960',
                '--remote-debugging-port=9222'
            ],
        });
    });

    beforeEach(async function(){
        /* 2. 将this指向mocha，表示当前测试用例，以供 appendToContext 使用 */
        that = this;
    })

    it('访问百度并验证',  async () => {
        /* 3 开始执行测试 */
        page = await browser.newPage();
        await page.setViewport({width: 1280, height: 960});
        await page.goto('https://www.baidu.com');
        let btn = await page.waitForXPath("//*[text()='新闻']")
        await btn.click()
        await page.waitForTimeout(2000)
        appendToContext(that,"1607431827000.png");
    }).timeout(20000);

    after(async function(){
        /* 5. 关闭浏览器 */
        await browser.close();
    });

    afterEach(async function(){
        /* 4. 截图，并将其添加到测试报告中 */
        let screenShotName = Date.parse(new Date()) + '.png'
        await page.screenshot({path: `reports/${screenShotName}`})
        appendToContext(this,screenShotName);
        await page.close();
    })
});