import Sublime from "../themes/sublime";

var sublime = new Sublime(),
    pageId = process.env.TEST_PAGE_ID,
    baseUrl = process.env.BUILDER_URL + '/build/' + pageId,
    builderUrl = baseUrl + '/pages';

module.exports = {
    'starting browser': function (browser) {
        sublime.setSublimeTheme();
        sublime.setAllPageMetas();
        sublime.setSiteMenus();
        sublime.setMongoData();
        browser.end();
    },

    'Testing home page': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/index');
        sublime.testIfSublimeBannerDescriptionIsCorrect();
        sublime.testIfHomePageReviewsSliderIsWorking('.carousel-review-slider', '.pvc-unrecommend');
    },

    'Testing about page': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/about');
        sublime.testAboutDescription();
        sublime.testAboutImageSection();
    },

    'Testing news page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/news');
        sublime.testNewsPostCountOnFirstLoad();
        sublime.testNewsPostCountAfterLoader();
    },

    'Testing if news detail page is working' : function (browser) {
        sublime.checkNewsPostWithOnlyMessage(browser);
        sublime.checkNewsPostWithPhotoAndMessage(browser);
        sublime.checkSharedLinkPost(browser);
        sublime.checkVideoPost(browser);
        sublime.checkSharedVideoPost(browser);
    },

    'Testing gallery page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/gallery');
        sublime.testSublimeGalleryCountOnFirstLoad();
        sublime.testSublimeGalleryCountAfterViewMore();
    },

    'Testing if gallery detail page is working' : function (browser) {
        let randomAlbum = sublime.getRandomAlbum();
        sublime.startBrowser(browser, baseUrl + '/albums/gallery/'+randomAlbum.slug);
        sublime.testIfAlbumPageIsWorkingCorrectly(randomAlbum);
    },

    'Testing events page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/events');
        sublime.testIfEventPagehasFbEventsWidget();
    },

    'Testing contact page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/contact');
        sublime.testContactPageDetails();
        sublime.testContactPageMap();
    },

    'Testing reviews page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/reviews');
        sublime.testIfReviewsAreParsingCorrectly();
    },

    'Testing if vampbox is working correctly' : function (browser) {
        sublime.startBrowser(browser, builderUrl);
        sublime.testIfVampBoxIsWorkingCorrectly();
    },

    'Testing error page ': function (browser) {
        sublime.startBrowser(browser, builderUrl + '/jpt');
        sublime.testIf404PageWorks();
    },

    'end of sublime test': function (browser) {
        browser.end();
    }
};
