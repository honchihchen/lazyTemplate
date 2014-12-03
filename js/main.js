/*globals console, _, jQuery, _*/
/* author: hon-chih.chen */

_.templateSettings = {
    interpolate: /\{\{\=(.+?)\}\}/g,
    escape: /\{\{\-(.+?)\}\}/g,
    evaluate: /\{\{(.+?)\}\}/g
};

var biglaker = {};

biglaker.TemplateFactory = function(src) {
    'use strict';
    var $cache,
        inited = false,
        ques = [],
        template = {},
        dataSrouce = src,
        
        getFromCache = function (que) {
            var element = que.selector;
            // cache selected element 
            if (template[element] === undefined) {
                template[element] = _.template($cache.find(element).html()); 
            }
            que.deferred.resolve(template[element]);
        },
        
        loadTemplate = function (elem) {   
            inited = true;                   
            var promise = jQuery.ajax({ 
                url: dataSrouce,
                dataType : 'html' 
            });
            return promise;
        },
        
        resolveQues = function () {
            var i,
                que;         
            for (i = ques.length - 1; i >= 0; i -= 1) {
                que = ques[i];
                ques.splice(i,1);
                getFromCache(que);
            }  
        },
        /*
         * only the first request will trigger loadTemplate
         */
        getTemplate = function (element) {
            var selector = _.pluck(ques, 'selector'),
                index = _.indexOf(selector, element),
                que;
            if (index > -1) {
                // already in que
                que = ques[index];
            } else {
                // create a new que
                que = {
                    deferred : jQuery.Deferred(),
                    selector : element
                };
                if ($cache === undefined) {
                    // add to que
                    ques.push(que); 
                }        
            }
            
            // load template
            if (!inited) { 
                loadTemplate(element).done(function (data) {
                    $cache = jQuery('<div></div>').html(data);
                    resolveQues();
                });
            } else { 
                if ($cache !== undefined) {
                    // cache ready
                    getFromCache(que);  
                }
            }
            return que.deferred.promise();
        };
        return {
            getTemplate : getTemplate
        };
};


biglaker.factory = (function (src) {
    'use strict';
    var instance;
    return {
        getInstance:  function (options) {
            if ( instance  ===  undefined )  {
                instance = new biglaker.TemplateFactory(src);
            }
            return instance;
        }
    };
}('data/template.html'));


biglaker.HeaderView = Backbone.View.extend({
    factory : biglaker.factory.getInstance(),
    initialize : function (options) {
        'use strict';
        this.label = options.label;
        this.render();
    },
      
    render : function () {
        'use strict';
        var that = this,
            id = '#tpl-header';
        this.factory.getTemplate(id).done(function (template) {
            that.$el.html(template({label: that.label}));
        }); 
        return this;
    }   
});

biglaker.BodyView = Backbone.View.extend({
    factory : biglaker.factory.getInstance(),
    label : '',
    initialize : function (options) {
        'use strict';
        this.label = options.label;
        this.render();
    },
      
    render : function () {
        'use strict';
        var that = this,
            id = '#tpl-body';
        this.factory.getTemplate(id).done(function (template) {
            that.$el.html(template({label: that.label}));
        }); 
        return this;
    }   
});

biglaker.FooterView = Backbone.View.extend({
    label : '',
    factory : biglaker.factory.getInstance(),
    initialize : function (options) {
        'use strict';
        this.label = options.label;
    },
    
    events : {
        'click a' : 'onClicked'
    },
    
    onClicked : function (e) {
        'use strict';
        this.render();
        return false;
    },
      
    render : function () {
        'use strict';
        var that = this,
            id = '#tpl-footer';
        this.factory.getTemplate(id).done(function (template) {
            that.$('.container').html(template({label: that.label}));
        }); 
        return this;
    }   
});


biglaker.app = (function($) {
    'use strict';
    var slides,
        data,
        headerView1,
        headerView2,
        bodyView1,
        bodyView2,
        footer,

        initialize = function () {
            headerView1 = new biglaker.HeaderView({
                el: '#header1',
                label: 'Header View 1'
            });
            headerView2 = new biglaker.HeaderView({
                el: '#header2',
                label: 'Header View 2'
            });
            bodyView1= new biglaker.BodyView({
                el: '#body1',
                label: 'Body View 1'
            });
            bodyView2 = new biglaker.BodyView({
                el: '#body2',
                label: 'Body View 2'
            });
            footer = new biglaker.FooterView({
                el: '#footer',
                label: 'Footer View'
            });
        };

    return {
        initialize: initialize
    };
}(jQuery));


jQuery(function() {
    'use strict';
    biglaker.app.initialize();
});
