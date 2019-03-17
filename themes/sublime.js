import AbstractTheme from "../themes/abstractTheme";

var pageId = process.env.TEST_PAGE_ID,
    baseUrl = process.env.BUILDER_URL + '/build/' + pageId;

class Sublime extends AbstractTheme{

    constructor() {
        super();
    }

    setSublimeTheme() {
        return this.mysql.update('fbpages_metas', {
            'key': 'theme_name',
            'value': 'sublime'
        }, {'pageid': this.getPageId(), 'key': 'theme_name'});
    }


    startBrowser(browser, builderUrl) {
        this.browser = browser;
        browser.url(builderUrl);  // visit the url
        browser.waitForElementVisible('body', 20000);
        console.log("Site is opened.")// wait for the body to be rendered
    }

    testIfSublimeBannerDescriptionIsCorrect() {
        let bannerOption = JSON.parse(this.pageMetas['facebook']);
        let description;
        if (bannerOption['display_content'] == 1) { // if user choose option to display the description
            if (bannerOption['display_custom'] == 1) {
                description = bannerOption['custom_content'];
                console.log("Custom Banner Description: " + description);

            }
            if (bannerOption['display_custom'] == 0) {
                description = this.mongoData.about;
                console.log("Default Fb Banner Description: " + description);
            }
        }

        if (bannerOption['display_content'] == 0) { // if user hides the description
            this.browser.verify.elementNotPresent(".jumbotron");
            console.log('Banner description is hidden');
        }
    }

    testAboutImageSection() {
        let aboutMetas = JSON.parse(this.pageMetas['about']);
        if (aboutMetas.about_image_switch === "0") {
                   console.log("Default facebook profile picture is displaying");
                   this.browser.verify.attributeContains('.img-holder img', 'src', this.getProfilePicture());
        }

        if (aboutMetas.about_image_switch === "1") {
            console.log("Custom picture is displaying");
            this.browser.verify.attributeContains('.img-holder img', 'src', aboutMetas.about_image);
        }

        if (aboutMetas.about_image_switch === "-1") {
            console.log("No image in about section");
            this.browser.verify.elementNotPresent('.img-holder');
        }
    }


    getProfilePicture() {
        if (this.profilePicture !== false) {
            return this.profilePicture;
        }
        let albums = this.mongoData.albums.data;
        if (albums) {
            for (let index in albums) {
                let album = albums[index];
                if (album.name === "Profile Pictures") {
                    let coverImageid = album.cover_photo.id;
                    let photos = album.photos;
                    for (let photoIndex in photos) {
                        let photo = photos[photoIndex];
                        if (photo.id === coverImageid) {
                            this.profilePicture = photo.large_image;
                            return this.profilePicture;
                        }
                    }
                }
            }
        }
        return albums;
    }

    getTextWithoutSpace(text) {
        return text.replace(/\s/g,'');
    }
    getTextWithoutHtml(text) {
        return text.replace(/<[^>]*>/g,'');
    }
    getTextWithoutNewline(text){
        return text.replace(/(\r\n|\n|\r)/g,'');
    }
    testAboutDescription() {
        let aboutDescription = JSON.parse(this.pageMetas['about']);
        let self = this ;
        if(aboutDescription['about_content_switch'] == 0){             // Default Facebook About Description
            let defaultFacebookDescription = this.mongoData.description;
            console.log(defaultFacebookDescription);
            let aboutText = aboutDescription ['about_content'];
            let expectedValue = self.getTextWithoutSpace(defaultFacebookDescription);
            let filterAboutText1 =self.getTextWithoutSpace(aboutText);
            let filterAboutText2 =self.getTextWithoutNewline(filterAboutText1);
            if (expectedValue == filterAboutText2){
                console.log("Page has Default Facebook about description");
            }
        }
        if(aboutDescription['about_content_switch'] == 1) {            //Custom About Description
            let aboutText = aboutDescription['about_content'];
            this.browser.getText(".ckeditor-custom-about",function (result) {
                let dummyAboutText = "Welcometoourwebsite!Takealookaroundandfeelfreetocontactusformoreinformation.";
                let actualValue = self.getTextWithoutSpace(result.value);
                let expectedValue = self.getTextWithoutSpace(aboutText);
                let finalValue =self.getTextWithoutHtml(expectedValue);
                require("assert").equal(actualValue, finalValue);
                if(finalValue == dummyAboutText){                      //Checking if page has dummy text
                    console.log("Page has Dummy About text");
                }
                else{
                    console.log('Page has custom about text');
                }
            });
        }
    }

    testNewsPostCountOnFirstLoad() {
        let self =this;
        this.browser.elements('css selector','#news-container .box', function(result){
            let newsPostsOnFirstLoad = result.value.length;
            if(newsPostsOnFirstLoad == 0 ){
                self.browser.assert.containsText("#news-container p.text-center","Currently there are no news");
            }
            if(newsPostsOnFirstLoad == 10){
                console.log("On first load, there are 10 news posts");
            }
            if(newsPostsOnFirstLoad < 10){
                console.log("On first load, there are "+newsPostsOnFirstLoad+ " news posts");
            }
        });
    }
    testNewsPostCountAfterLoader() {
        let posts = this.mongoData.posts.data,
            totalPostsInMongo = posts.length,
            filteredPosts = this.mongoData.posts.data.filter(function (news) {
                return (news.type !== 'event' && (news.link || news.picture || news.message)) //filtering news posts
            }),
            totalPostsInMongoAfterFiltering = Object.keys(filteredPosts).length;
        console.log("Total news posts in Mongo: " + totalPostsInMongo)
        console.log("Total news posts in Mongo after filtering: " + totalPostsInMongoAfterFiltering);


        let self = this;
        if(totalPostsInMongo == 0){
            self.browser.assert.containsText("#news-container p.text-center","Currently there are no news");
            self.browser.waitForElementNotPresent('#loader', 20000);
        }
        if(totalPostsInMongo > 0){
            let newsPage = self.siteMenus['news'],
                noOfHiddenNews = 0,
                hiddenNews = newsPage.exceptions;

            if(hiddenNews) {
                var array = JSON.parse(hiddenNews);
                let noOfHiddenNews = array.length;
                console.log("No. of hidden posts " + noOfHiddenNews);
            }


            let noOfNewsPostsDisplaying = totalPostsInMongoAfterFiltering - noOfHiddenNews;
            if(noOfNewsPostsDisplaying < 10){
                console.log("As there are only " + noOfNewsPostsDisplaying+ " , loader should not display");
                self.browser.execute('window.scrollTo(0,document.body.scrollHeight);');
                self.browser.verify.elementCount('.news-listing-item', noOfNewsPostsDisplaying);
            }
            if(noOfNewsPostsDisplaying > 10){
                let postCount = 10;
                console.log("No. of news post displaying: ", + noOfNewsPostsDisplaying);

                let timesToClick = Math.ceil(noOfNewsPostsDisplaying/postCount);
                console.log("No. of load: " + timesToClick);
                for(let i = 1; i < timesToClick; i++){
                    self.browser.execute('window.scrollTo(0,document.getElementById("loader").scrollHeight);');
                    self.browser.waitForElementNotVisible('#loader', 10000);
                    postCount = postCount + 10;
                    if (timesToClick - 1 == i) {  //8
                        if (noOfNewsPostsDisplaying / postCount % 3 !== 0) { //this is done because what if each time we load 5 and there are total 23 posts
                            let newCount = noOfNewsPostsDisplaying - postCount;
                            let finalPostCount = postCount + newCount;
                            console.log(finalPostCount + " all news posts are loaded.");
                        }
                    }
                }
                this.browser.getAttribute('.onfacebook a[title="View More Posts On Facebook"]', "href", function(result){ // checking "View More Posts On Facebook"
                    this.assert.equal(result.value,"http://facebook.com/"+pageId);
                })
            }
        }
    }


    testSublimeGalleryCountOnFirstLoad() {
        let self =this;
        this.browser.elements('css selector','#albums-container .box', function(result){
            let albumsOnFirstLoad = result.value.length;
            if(albumsOnFirstLoad == 0 ){
                self.browser.assert.containsText("#albums-container p.text-center","There are currently no albums.");
            }
            if(albumsOnFirstLoad== 9){
                console.log("On first load, there are 9 albums on first load");
            }
            if(albumsOnFirstLoad < 9){
                console.log("On first load, there are "+ albumsOnFirstLoad+ " albums");
            }
        });
    }

    testSublimeGalleryCountAfterViewMore() {
        let albums = this.mongoData.albums.data,
            filteredAlbums = albums.filter(function(album){ // filtering mongo albums and return only albums  with no null photo
                return (album.count > 0)
            }),
            totalAlbums = filteredAlbums.length;
        console.log("Total albums in mongo: " + albums.length);
        console.log("Total albums after filtering empty albums: " + totalAlbums);

        let self = this;
        let galleryPage = self.siteMenus['gallery'],  //gallery:'site_menu' >>name
            noOfHiddenAlbums,
            hiddenAlbums = galleryPage.exceptions;
        if(hiddenAlbums) {
            var array = JSON.parse(hiddenAlbums);
            noOfHiddenAlbums = array.length;
            console.log("No. of hidden posts " + noOfHiddenAlbums);
        }
        if(!hiddenAlbums) {
            noOfHiddenAlbums = 0;
        }
        let noOfAlbumsDisplaying = totalAlbums - noOfHiddenAlbums;
        if (noOfAlbumsDisplaying  === 0 || totalAlbums === 0){
            self.browser.assert.containsText("#albums-container p.text-center","There are currently no albums.");
            self.browser.waitForElementNotPresent("#albums-load-more",1000);
        }
        if(noOfAlbumsDisplaying > 0 && noOfAlbumsDisplaying < 10 ){
            console.log("As there are only " + noOfAlbumsDisplaying+ " , albums loader should not display");
            self.browser.verify.elementCount('#albums-container .box', noOfAlbumsDisplaying);
        }
        if(noOfAlbumsDisplaying > 9){
            let postCount = 9;
            console.log("No. of albums displaying: ", + noOfAlbumsDisplaying);

            let timesToClick = Math.ceil(noOfAlbumsDisplaying/postCount);
            console.log("No. of load: " + timesToClick);
            for(let i = 1; i < timesToClick; i++){
                this.browser.execute('window.scrollTo(0,document.body.scrollHeight);');
                self.browser.click("#albums-load-more");
                self.browser.pause(10000);
                postCount = postCount + 9;
                if (timesToClick - 1 === i) {
                    let newCount = noOfAlbumsDisplaying - postCount,
                        finalPostCount = postCount + newCount;
                    self.browser.verify.elementCount('#albums-container .box',noOfAlbumsDisplaying)
                }
            }
        }
    }

    testIfAlbumPageIsWorkingCorrectly (album) {
        let photos =  album.photos,
            photosKeys = Object.keys(photos),
            totalPhotos = photosKeys.length;
        if(totalPhotos === 0){
            console.log("This is null Facebook album");
        }
        if(totalPhotos !== 0){
            if(totalPhotos < 10) {
                console.log("No. of photos in this album: " + totalPhotos)
                this.browser.pause(3000);
                this.browser.verify.elementCount('.box',photosKeys.length);
                this.browser.execute('window.scrollTo(0,document.getElementById("loader").scrollHeight);');
                this.browser.waitForElementNotPresent('#loader', 1000);
            }
            if(totalPhotos> 9) {
                console.log("No. of photos in this album: " + totalPhotos)
                let photosCount = 9;
                let timesToClick = Math.ceil(totalPhotos / photosCount);
                for (let i = 1; i < timesToClick; i++) {
                    this.browser.execute('window.scrollTo(0,document.getElementById("loader").scrollHeight);');
                    photosCount = photosCount + 9;
                    if (timesToClick - 1 == i) {
                        if (totalPhotos / photosCount % 2 !== 0) { //this is done because what if each time we load 5 and there are total 23 posts
                            let newCount = totalPhotos - photosCount,
                                finalPhotosCount = photosCount + newCount;
                            this.browser.verify.elementCount('.box',finalPhotosCount);
                        }
                    }
                }
            }
        }
    }


    testIfEventPagehasFbEventsWidget() {
        this.browser.pause(5000);
        this.browser.verify.elementPresent('.fb_iframe_widget span iframe');
        this.browser.getAttribute('.onfacebook a[title="view events on facebook"]', "href", function(result){
            this.assert.equal(result.value,"http://facebook.com/"+ pageId + '/events');
        })
    }


    testContactPageDetails() {
        let contactMetas = JSON.parse(this.pageMetas.contact),
            phone = contactMetas.contact_phone,
            address = contactMetas.contact_address,
            email = contactMetas.contact_email,
            pageHour = this.mongoData.hour;
        if(contactMetas.contact_phone_switch == 1) {
            console.log("Phone:" + phone)
            this.browser.verify.containsText('.info address:nth-child(1) span.add-info',phone);
        }
        if(contactMetas.contact_phone_switch == 0) {
            this.browser.verify.elementNotPresent('.info address:nth-child(1) h4');
            console.log('Contact no. is hidden');
        }

        if (contactMetas.contact_address_switch == 1) {
            console.log("Address:" + address)
            this.browser.verify.containsText('.info address:nth-child(2) span.add-info',address);
        }

        if (contactMetas.contact_address_switch == 0) {
            this.browser.verify.elementNotPresent('.info address:nth-child(2) h4');
            console.log('Address is hidden');
        }

        if(contactMetas.contact_email_switch == 1) {
            console.log('Email: '+ email);
            this.browser.verify.containsText('.info address:nth-child(3) span.add-info',email);
        }
        if(contactMetas.contact_email_switch == 0) {
            this.browser.verify.elementNotPresent('.info address:nth-child(3) h4');
            console.log('Contact email is hidden');
        }
    }

    testContactPageMap()
    {
        let mapSwitch = JSON.parse(this.pageMetas.map_switch);
        if(mapSwitch == 1) {
            this.browser.verify.elementPresent('.map');
        }
        if(mapSwitch == 0) {
            this.browser.verify.elementNotPresent('.map');
        }
    }

    testIfReviewsAreParsingCorrectly(){
        let reviewsMeta = JSON.parse(this.pageMetas['fb_reviews']),
            reviews = this.mongoData.ratings.data,
            totalReviews= reviews.length;
        let filteredPositiveReviews = reviews.filter(function(review){ // filtering mongo albums and return only albums  with no null photo
                return (review.recommendation_type == "positive")
            }),
            positiveReviews= filteredPositiveReviews.length;
        let filteredNegativeReviews = reviews.filter(function(review){ // filtering mongo albums and return only albums  with no null photo
                return (review.recommendation_type == "negative")
            }),
            negativeReviews = filteredNegativeReviews.length;

        console.log("Page has " + totalReviews + " total reviews.");
        console.log("Positive reviews: " + positiveReviews);
        console.log("Negative reviews: " + negativeReviews);


        if(!reviewsMeta.has_active_review_page){
            console.log("Reviews page is hidden");
        }
        if(reviewsMeta.has_active_review_page){
            if(reviewsMeta.show_positive_reviews){ // checking reviews page has only positive reviews
                console.log("Only positive recommendations are displaying in Reviews page")
                if(positiveReviews < 9){
                    this.browser.verify.elementCount('.review-holder .review', positiveReviews);
                    this.browser.waitForElementNotPresent(".review-view-more", 1000);
                }
                if(positiveReviews > 8){
                    this.browser.execute('window.scrollTo(0,document.body.scrollHeight);');
                    this.browser.verify.elementCount('.review-holder .review', reviews.length);
                    let initialReviews = 8;
                    for(let i = 1; i < float(totalReviews % 8) ;i++) {
                        this.browser.execute('window.scrollTo(0,document.body.scrollHeight);');
                        this.browser.waitForElementNotVisible('#loader', 3000);
                        initialReviews = initialReviews + 8;
                        this.browser.verify.elementCount('.review-holder .review', initialReviews);
                    }
                }
                if(positiveReviews == 0){
                    this.browser.getText("",function(result){
                        this.assert.equal(result.value,"Sorry, there are currently no reviews on your Facebook page.");
                    })
                }
            }
            if(!reviewsMeta.show_positive_reviews){
                console.log("Both negative & positive recommendations are displaying in Reviews page");
                let self=this;
                if(totalReviews < 9){
                    this.browser.verify.elementCount('.review-holder .review', totalReviews);
                    this.browser.waitForElementNotPresent(".review-view-more", 1000);
                }
                if(totalReviews > 8){
                    let reviewsCount = 8;
                    let timesToClick = Math.ceil(totalReviews / reviewsCount);

                    for(let i = 1; i < timesToClick; i++){
                        this.browser.execute('window.scrollTo(0,document.body.scrollHeight);');
                        self.browser.click("#review-wrap .row .col-lg-12 a.review-view-more");
                        reviewsCount = reviewsCount + 8;
                        if (timesToClick - 1 === i) {
                            let newCount = totalReviews - reviewsCount,
                                finalCount = reviewsCount + newCount;
                            self.browser.assert.equal(finalCount,totalReviews);
                            self.browser.verify.elementCount('.review-holder .review',totalReviews)
                        }
                    }

                }
            }
        }
    }


    testIfVampBoxIsWorkingCorrectly() {
        let self=this;
        this.browser.execute('window.scrollTo(0,0);');
        this.browser.click('.powered-by-light', function(result){
            self.browser.assert.cssProperty("#vamp_box", "overflow", "visible");
        });
    }

    testIf404PageWorks() {
        this.browser.verify.elementPresent('.errorWrap--head')
        this.browser.verify.containsText('.errorWrap--head', '404')
    }

    endBrowser() {
        this.browser.end();
    }
}

export default Sublime
