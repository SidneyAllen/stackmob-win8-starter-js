// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;



    StackMob.init({
        publicKey: "ef5337b7-1d0c-489f-a68a-dcaf4cb8e499",
        apiVersion: 0
    });

    var todoapp = (function ($) {

        var Todo = StackMob.Model.extend({
            schemaName: "todo"
        });

        var Todos = StackMob.Collection.extend({
            model: Todo
        });

        var HomeView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-home').html());
                this.router = this.options.router;
                this.collection = this.options.collection;
            },

            render: function () {
                var self = this;

                self.$el.html(this.template());

                var listView = new ListView({ collection: self.collection }).render();
                var container = $(self.el).find(".page-region-content");

                $(container).append(listView.el);
            },
        });

        var ListView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-list').html());
                this.router = this.options.router;
                this.collection = this.options.collection;
                this.collection.bind("all", this.render, this);
            },

            render: function () {
                var self = this;

                var container = $("<ul class='list fluid'></ul>");

                container.empty();
                self.collection.each(function (model) {
                    console.log(JSON.stringify(model.toJSON()));
                    if (model.get('todo_id') !== undefined) {
                        container.append(self.template(model.toJSON()));
                    }
                });

                $(self.el).html(container);
                return this;
            },

        });


        var AddView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-add').html());
                this.router = this.options.router;
                this.collection = this.options.collection;
            },

            events: {
                "click #createBtn": "create"
            },

            render: function () {
                var self = this;

                self.$el.html(self.template({ name: "" }));
            },

            create: function () {
                var self = this;

                var todo = new Todo({ name: $("#title").val() });

                todo.create({
                    success: function (model) {
                        self.collection.add(model);
                        self.router.navigate("#", { trigger: true });
                    },
                    error: function (model, response) { }
                });

                return this;
            }
        });

        var DetailView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-update').html());
                this.router = this.options.router;
                this.model = this.options.model;
            },

            events: {
                "click #createBtn": "save",
                "click #deleteBtn": "delete"
            },

            render: function () {
                var self = this;

                self.$el.html(self.template(self.model.toJSON()));
            },

            save: function () {
                var self = this;

                self.model.save({ name: $("#title").val() },
                    {
                        success: function (model) {
                            console.log("update success");
                            self.router.navigate("#", { trigger: true });
                        },
                        error: function (model, response) { }
                    });

                return this;
            },

            delete: function () {
                var self = this;

                self.model.destroy(
                    {
                        success: function (model) {
                            console.log("delete success");
                            self.router.navigate("#", { trigger: true });
                        },
                        error: function (model, response) { }
                    });

                return this;
            }
        });

        var UserView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-user').html());
                this.router = this.options.router;
                this.collection = this.options.collection;
            },

            events: {
                "click #loginBtn": "login",
                "click #signupBtn": "signup"
            },

            render: function () {
                var self = this;

                self.$el.html(this.template());
            },

            login: function () {
                var self = this;

                var user = new StackMob.User({ username: $("#username").val(), password: $("#password").val() });

                user.login(true, {
                    success: function (model) {
                        console.log(StackMob.getLoggedInUser());
                        console.log("login success");
                        self.router.navigate("#", { trigger: true });
                    },
                    error: function (model, response) { }
                });

                return this;
            },

            signup: function () {
                var self = this;

                var user = new StackMob.User({ username: $("#username").val(), password: $("#password").val() });
                user.create({
                    success: function (model) {
                        self.router.navigate("#", { trigger: true });
                    },
                    error: function (model, response) { }
                });

                return this;
            }
        });

        var UploadView = Backbone.View.extend({

            initialize: function () {
                this.template = _.template($('#tpl-upload').html());
                this.router = this.options.router;
                this.collection = this.options.collection;
            },

            events: {
                "click #uploadBtn": "upload"
            },

            render: function () {
                var self = this;

                self.$el.html(this.template());
            },

            upload: function () {
                return this;
            }
        });

        var AppRouter = Backbone.Router.extend({
            routes: {
                "": "home",
                "add": "add",
                "update/:id": "update",
                "user": "user",
                "upload": "upload"
            },

            initialize: function (options) {
                this.collection = options.collection;
            },

            home: function () {
                this.changePage(new HomeView({ router: this, collection: this.collection }), true);
            },

            add: function () {
                this.changePage(new AddView({ router: this, collection: this.collection }), true);
            },

            update: function (e) {
                console.log(e);
                var model = this.collection.get(e);
                this.changePage(new DetailView({ router: this, model: model }), true);
            },

            user: function () {
                this.changePage(new UserView({ router: this, collection: this.collection }), true);
            },

            upload: function () {
                this.changePage(new UploadView({ router: this, collection: this.collection }), true);
            },

            changePage: function (page, reverse) {
                var activePage = $('.ui-active');

                if ($(activePage).html() !== undefined) {

                    var currPage = document.querySelector(".page");
                    WinJS.UI.Animation.exitPage(currPage).then(
                        function completed(response) {
                            // console.log("exit");
                            $(activePage).remove();
                            page.render();
                            $('body').append($(page.el));

                            var currPage = document.querySelector(".page");
                            WinJS.UI.Animation.enterPage(currPage).then(
                                function completed(response) {
                                    //  console.log("enter");
                                }
                             );;
                        }
                     );
                } else {
                    page.render();
                    $('body').append($(page.el));

                    var currPage = document.querySelector(".page");
                    WinJS.UI.Animation.enterPage(currPage).then(
                        function completed(response) {
                            console.log("enter");
                        }
                     );;
                }
            }
        });

        var initialize = function () {

            var todos = new Todos({ async: false });
            todos.fetch({
                success: function (data) {
                    console.log("success!!!! to dos loaded");
                }
            });

            var app_router = new AppRouter({ collection: todos });
            Backbone.history.start();
        }

        return { initialize: initialize };

    }(jQuery));


    app.onactivated = function (args) {
  
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.

                todoapp.initialize()



            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
