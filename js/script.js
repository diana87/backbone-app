//запускаем jquery когда документ готов, объявляем про-во имен для приложения
$(function(){
	App = {
		Models: {},
		Views: {},
		Collections: {}
	};

	//шаблон используемый в View person(user)
	template = function(id) {
		return _.template($('#' + id).html());
	};

	//model user
	App.Models.Person = Backbone.Model.extend({
		
	});

	//collection of users
	App.Collections.Persons = Backbone.Collection.extend({
		model: App.Models.Person, //connect collection of users with model (user)
		localStorage: new Backbone.LocalStorage("users-backbone"),
		//sort depend on column type = comparator
		sortByName: function () {
			this.comparator = function(model) {
				return model.get('name');
			};
			this.sort();
		},
		sortByJob: function() {
			this.comparator = function(model) {
				return model.get('job');
			}
			this.sort();
		},
		sortByAge: function() {
			this.comparator = function(model){
				return model.get('age');
			}
			this.sort();
		}
		
	});
	
	//view of user
	App.Views.Person = Backbone.View.extend({
		tagName: 'tr',
		initialize: function() {  
        	this.model.on('change', this.render, this); 
        	this.model.on('destroy', this.remove, this);
		},
		template: template('itemTemplate'),
		render: function() {
			var template = this.template(this.model.toJSON());
			this.$el.html( template );
			return this;
		},
		//event on button = edit
		events:{
			'click .editBut': 'editUser', //allow to edit data
			'click .deleteBut': 'destroy',
			'keypress .edit'  : 'updateOnEnter', //save updated data
			//'blur .edit'      : 'close'
			
		},
		editUser: function() {
			this.$el.addClass("editing"); //add new class - input form
			this.$('.editBut').val("Press Enter key").attr('disabled','disable');
      		this.$('.edit').focus(); //?no good
		},
		updateOnEnter: function(e) {
			if(e.keyCode == 13) 
			this.close();//if press Enter key, save data
		},
		close: function() {
		//get attributes from input or if input is empty save current data
			var name = this.$('input[type=name]').val() || this.model.get('name'),
				age = Number(this.$('input[type=age]').val()) || this.model.get('age'),
				job = this.$('input[type=job]').val() || this.model.get('job');
		//save the data
			this.model.save({
				name: name,
				age: age,
				job: job
			});
			this.$('.editBut').val("Edit").removeAttr('disabled');
			this.$el.removeClass("editing"); //hide input form
			
		},
	
		destroy: function() {
    		this.model.destroy();
		},
		remove: function() {
    		this.$el.remove(); 
		}
	});

	//view of full users
	App.Views.Persons = Backbone.View.extend({
		el: $('#ad-table'),
		events: {
			'click tr:first' : 'sorting'//click on table caption
		},
		initialize: function() {
			this.collection.on('add', this.addOne, this );
			//this.listenTo(this.collection, 'sort', this.renderSort);
			this.collection.fetch();
        },

		render: function() {
			this.collection.each(this.addOne, this);
			return this;
		},
		addOne: function(person) {
			// создавать новый дочерний вид
			var personView = new App.Views.Person({ model: person });
			// добавлять его в корневой элемент
			this.$el.append(personView.render().el);
		},
		addAll: function() {
			this.collection.each(this.addOne);
		},
		sorting: function(e) {
			var current = $(e.target); //get clicked td
			this.listenTo(this.collection, 'sort', this.renderSort);
			//depend on data-type call required function to sort
			switch (current.data('type')) {
				case 'name':
					this.collection.sortByName();
					break;
				case 'age':
					
					this.collection.sortByAge();
					break;
				case 'job':
					this.collection.sortByJob();
					break;
			}
		},
		renderSort: function() {
			this.$el.find('td').remove();
			this.render();
		}
		
		
	});

	//new view for added user
	App.Views.AddPerson = Backbone.View.extend({
		el: '.userplace',
        events: {
            'click .add' : 'getData',
        },
        initialize: function() {
        },
        getData: function(e) {
            e.preventDefault();
			var newPerson,
				name =  $('#username').val(),
            	age = Number($('#age').val()),
            	job = $('#job').val();
			newPerson = {
            	name: name,
            	age: age,
            	job: job
            };
            this.collection.create(newPerson, {sort: false}); //to add and save
        },

    });
    App.Views.Search = Backbone.View.extend({
    	el: '.container-fluid',
    	events: {
			'click .btn-default': 'searching',
			'keypress .form-control': 'searchByEnter'
		},
		searching: function() {
			var value = this.$('.form-control').val(),
				reg = new RegExp(value, 'ig');
			$('td').each(function(index) {
				if($(this).hasClass('find')){
					$(this).removeClass('find');
				}
				else {
					if(reg.test($(this).text())) {
					$(this).addClass('find');
					}
				}
			})
		},
		searchByEnter: function (e) {
			if (e.keyCode == 13) this.searching();
			
		}
	}); 

	usersCollection = new App.Collections.Persons();
	
	var personsView = new App.Views.Persons({ collection: usersCollection});
	var addPersonView = new App.Views.AddPerson({ collection: usersCollection});
	var searchView = new App.Views.Search({ collection: usersCollection});
		
});
