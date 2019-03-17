import mysqlProvider from "../services/mysql";

var pageId = process.env.TEST_PAGE_ID,
    baseUrl = process.env.BUILDER_URL + '/build/' + pageId,
    builderUrl = process.env.BUILDER_URL + '/build/' + pageId + '/pages',
    everythingUrl = process.env.NODE_API + '/pages/' + pageId + '/everything',
    axios = require('axios');

class AbstractTheme {
    async setMongoData() {
        if (this.mongoData.length === 0) {
            this.mongoData = await axios.get(everythingUrl);
            this.mongoData = this.mongoData.data.data;
        }
    }

    getPageId() {
        return pageId;
    }

    constructor() {
        this.mysql = new mysqlProvider;
        this.mongoData = [];
        this.pageMetas = [];
        this.siteMenus = [];
        this.profilePicture = false;
        this.postsToTest = { "post_with_only_message" : "i-am-gole",
            "post_with_photo_and_message" :"test",
            "shared_link_post":"thibaut-courtois",
            "post_with_video":"this-is-it",
            "shared_video_post":"instagram" };

    }

    async setAllPageMetas() {
        if (this.pageMetas.length === 0) {
            let pageMetas = await this.mysql.statement('select * from fbpages_metas where pageid=' + pageId);
            for (let pageMeta in pageMetas) {
                this.pageMetas[pageMetas[pageMeta].key] = pageMetas[pageMeta].value; //setting key value only
            }
        }
    }
    
    testIfHomePageReviewsSliderIsWorking(sliderDiv, negativeRecommendIcon) {
        let reviewsMeta = JSON.parse(this.pageMetas['fb_reviews']);
        let recommendations = this.mongoData.ratings.data;
        let recommendationLength = recommendations.length;


        if(recommendationLength == 0){
            console.log("This page doesn't have any fb reviews");
            this.browser.verify.elementNotPresent(sliderDiv)
        }
        if(recommendationLength > 0){
            console.log('No. of recommendations: '+recommendationLength); //recommendation length
            if (reviewsMeta.switch && reviewsMeta.homepage_switch) {
                if(reviewsMeta.show_positive_reviews){ // checking homepage slider has only positive reviews
                    console.log("Only positive recommendations are displaying in Reviews slider")
                    this.browser.verify.elementPresent(sliderDiv)
                    this.browser.verify.elementNotPresent(negativeRecommendIcon);
                }
                if(!reviewsMeta.show_positive_reviews){ // checking home page slider has both negative & positive reviews
                    console.log("Both negative & positive recommendations are displaying in Reviews slider")
                    this.browser.verify.elementPresent(sliderDiv);
                    this.browser.verify.elementPresent(negativeRecommendIcon);
                }
            }
            if(!reviewsMeta.homepage_switch){ // checking if page homeslider is OFF
                console.log("Reviews slider is hidden in homepage");
                this.browser.verify.elementNotPresent(sliderDiv);
            }
        }

    }



    getRandomAlbum() {
        var totalAlbums = this.mongoData.albums.data,
            totalAlbumsLength = Object.keys(totalAlbums).length,
            randomAlbumIndex = Math.floor(Math.random() * totalAlbumsLength),
            randomAlbum = totalAlbums[randomAlbumIndex],
            albumName = randomAlbum.name;
        console.log('Total albums length: ' + totalAlbumsLength)
        console.log("Random Album of index: " + randomAlbumIndex)
        console.log("Album name: " + albumName)
        return randomAlbum;
    }

    getRandomPost() {
        var totalPosts = this.mongoData.posts.data,
            totalPostsLength = Object.keys(totalPosts).length,
            randomPostIndex = Math.floor(Math.random() * totalPostsLength),
            randomPost = totalPosts[randomPostIndex];
        console.log("random Post Index " +randomPostIndex);
        console.log("total post length " + totalPostsLength);
        return randomPost;
    }
    getHiddenPost(){
        let newsPage = this.siteMenus['news'],
            hiddenNews = newsPage.exceptions;
        var array = JSON.parse(hiddenNews);
        let noOfHiddenNews = array.length;
        return noOfHiddenNews;
    }
    getPost(postSlug){
        let posts = this.mongoData.posts.data;
        for(var i = 0; i < posts.length; i++){
            if(posts[i].slug == postSlug){
                return(posts[i]);
            }
        }
    }
    checkNewsPostWithOnlyMessage(browser){
        let postSlug = this.postsToTest["post_with_only_message"];
        console.log("post-slug: "+ postSlug);
        this.startBrowser(browser, baseUrl+'/news/' +this.postsToTest["post_with_only_message"]);
        console.log("Checking news post which has message only: " + baseUrl+'/news/' +this.postsToTest["post_with_only_message"]);

        let mongoPost = this.getPost(postSlug);
        this.checkNewsPostMessage(mongoPost);
        this.checkViewOnFacebook(mongoPost);
    }
    checkNewsPostWithPhotoAndMessage(browser){
        let postSlug = this.postsToTest["post_with_photo_and_message"];
        console.log("post-slug: "+ postSlug);
        this.startBrowser(browser, baseUrl+'/news/' +this.postsToTest["post_with_photo_and_message"]);
        console.log("Checking news post which has both photo and message: " + baseUrl+'/news/' +this.postsToTest["post_with_photo_and_message"]);

        let mongoPost = this.getPost(postSlug);
        this.checkNewsPostMessage(mongoPost);
        this.checkNewsPostPhoto(mongoPost);
        this.checkViewOnFacebook(mongoPost);
    }

    checkSharedLinkPost(browser){
        let postSlug = this.postsToTest["shared_link_post"];
        console.log("post-slug: "+ postSlug);
        this.startBrowser(browser, baseUrl+'/news/' +this.postsToTest["shared_link_post"]);
        console.log("Checking shared link news post: " + baseUrl+'/news/' +this.postsToTest["shared_link_post"]);

        let mongoPost = this.getPost(postSlug);
        this.checkSharedLinkPostPhoto(mongoPost);
        this.checkViewOnFacebook(mongoPost);
        console.log("Shared link post has link: " + mongoPost.link);
    }

    checkVideoPost(browser){
        let postSlug = this.postsToTest["post_with_video"];
        console.log("post-slug: "+ postSlug);
        this.startBrowser(browser, baseUrl+'/news/' +this.postsToTest["post_with_video"]);
        console.log("Checking uploaded videos post: " + baseUrl+'/news/' +this.postsToTest["post_with_video"]);

        let mongoPost = this.getPost(postSlug);
        this.checkNewsPostVideo(mongoPost);
        this.checkViewOnFacebook(mongoPost);
    }

    checkSharedVideoPost(browser){
        let postSlug = this.postsToTest["shared_video_post"];
        console.log("post-slug: "+ postSlug);
        this.startBrowser(browser, baseUrl+'/news/' +this.postsToTest["shared_video_post"]);
        console.log("Checking shared video post: " + baseUrl+'/news/' +this.postsToTest["shared_video_post"]);

        let mongoPost = this.getPost(postSlug);
        this.checkNewsPostVideo(mongoPost);
    }

    checkNewsPostMessage(mongoPost){
        this.browser.getText("#news p",function (result) {
            let actualText = mongoPost.message,
                expectedText = result.value;
            console.log("Message in mongo: " + actualText);
            console.log("Message in news detail page: "+ expectedText);
            this.assert.equal(result.value, actualText);
        });
    }
    checkNewsPostPhoto(mongoPost){
        this.browser.getAttribute('#news .img-holder img', 'src', function(result){
            this.assert.equal(result.value, mongoPost.full_picture);
        });
    }
    checkSharedLinkPostPhoto(mongoPost){
        this.browser.getAttribute('#news .img-holder img', 'src', function(result){
            this.assert.equal(result.value, mongoPost.picture);
        });
    }
    checkNewsPostVideo(mongoPost){
        if(!mongoPost.source){
            console.log("asdf")
        }
        if(mongoPost.source){
            this.browser.getAttribute('#news .img-holder video source', 'src', function(result){
                this.assert.equal(result.value, mongoPost.source);
            });
        }
    }
    checkViewOnFacebook(mongoPost){
        if(mongoPost.type == 'status'){
            console.log("This post doesn't have View On Facebook button");
            this.browser.verify.elementNotPresent('#news p a.viewonfb');
        }
        if(mongoPost.type == 'photo' || mongoPost.type == 'link' || mongoPost.type == 'video'){
            this.browser.getAttribute('#news p a.viewonfb','href',function(result){
                console.log("Checking View On Facebook " + mongoPost.id);
                this.assert.equal(result.value,"https://facebook.com/"+ mongoPost.id);
            })
        }
    }

    async setSiteMenus() {
        if (this.siteMenus.length === 0) {
            let siteMenus = await this.mysql.statement('select * from site_menu where pageid=' + pageId);
            for (let index in siteMenus) {
                this.siteMenus[siteMenus[index].name] = siteMenus[index]; //setting key value only
            }

        }
    }

    testIfNumberOfNewsInHomePageIsCorrect() {
        this.browser.verify.visible('.col-sm-4 box');

    }
}

export default AbstractTheme