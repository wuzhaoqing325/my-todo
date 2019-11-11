;(function(){
	'use strict'

	var $add_task = $('.add-task button');
	var $new_task = $('.add-task input');
	var task_list = [];
	var $task_list = $('.task-list');
	var $delete_task;
	var $detail_task;
	var $checkbox;
	var $task_detail_mask = $('.task-detail-mask');
	var $task_detail = $('.task-detail');
	var $update_detail;
	var $detail_title;
	var $detail_desc;
	var $detail_date;
	var $task_detail_mask = $('.task-detail-mask');
	var $remind = $('.remind');
	var $remind_content = $('.remind span');
	var $remind_know = $('.remind button');
	var timer;
	var $task_list_item;
	var $pop = $('.pop');
	var sure;

	init();

	// 删除弹出确定框
	function pop(arg){
		if(!arg){
			console.log('弹出内容不能为空！');
		}
		var dfd = $.Deferred();
		var $box = $('<div>'+
			'<span>'+arg+'</span>'+
			'<div><button class="sure">确定</button><button class="notSure">取消</button></div>'+
			'</div>');
		var $mask = $('<div></div>');

		var $box_title = $box.find('span');
		var $box_button = $box.find('div');
		var $box_sure = $box.find('button.sure');
		var $box_notSure = $box.find('button.notSure');
		$box_button.css({
			'text-align':'center'
		})
		$box_sure.css({
			width:80,
			height:40,
			background:'#2196f3',
			border:0,
			'border-radius':'3px',
			'margin-right':'10px'
		})
		$box_notSure.css({
			width:80,
			height:40,
			
			border:0,
			'border-radius':'3px',
			
		})

		$box_title.css({
			color:'#000',
			'font-size':'20px',
			'display':'block',
			'text-align':'center',
			'margin':'10px 0 20px'
		})
		$box_title.html(arg);

		$box.css({
			position:'fixed',
			width:300,
			height:'auto',
			background:'#fff',
			'border-radius':'3px',
			padding:'10px'	
		});

		$mask.css({
			position:'fixed',
			top:0,
			bottom:0,
			right:0,
			left:0,
			background:'rgba(0,0,0,.8)'	

		});
		$mask.appendTo($pop);
		$box.appendTo($pop);

		reset_position($box);

		$(window).on('resize',function(){
			reset_position($box);
		})

		function reset_position($box){
			var $window_width = $(window).width();
			var $window_height = $(window).height();
			var $box_width = $box.width();
			var $box_height = $box.height();
			
			var move_x = ($window_width - $box_width)/2;
			var move_y = ($window_height - $box_height)/2 -30;
			$box.css({
				left:move_x,
				top:move_y
			})
		}

		function hide_pop(){
			$box.hide();
			$mask.hide();
		}


		$box_sure.on('click',function(){
			sure = true;
			dfd.resolve(sure);
			hide_pop();
		})

		$box_notSure.on('click',function(){
			sure = false;
			dfd.resolve(sure);
			hide_pop();
		})

		return dfd.promise();
	}


	// 监听任务详情
	function listen_task_detail(){
		$detail_task.on('click',function(){
			var $this = $(this);
			var index = $this.parent().parent().data('index');

			show_task_detail(index);

		})
		$task_list_item.on('dblclick',function(){
			var index = $(this).data('index');
			show_task_detail(index);
		})
	}

	// 显示任务详情
	function show_task_detail(index){
		render_task_detail(index);
		$task_detail_mask.show();
		$task_detail.show();
	}

	// 隐藏任务详情
	function hide_task_detail(){
		
		$task_detail_mask.hide();
		$task_detail.hide();
	}

	// 渲染第几个任务详情
	function render_task_detail(index){
		var item = task_list[index];
		var tpl = 
			'<form>'+
			'<div class="detail-title">'+item.content+'</div>'+
			'<textarea class="detail-desc">'+(item.desc || "")+'</textarea>'+
			'<input class="detail-date"  value="'+(item.date || "")+'">'+
			'<button>更新</button>'+
			'</form>';
		
		$task_detail.html("");
		$task_detail.html(tpl);

		$update_detail = $task_detail.find('button');
		$detail_title = $task_detail.find('.detail-title');
		$detail_desc = $task_detail.find('.detail-desc');
		$detail_date = $task_detail.find('.detail-date');
		
		$detail_date.datetimepicker();

		update_task_detail(index);
		listen_hide_task_detail();	
	}

	// 监听任务截止时间
	function listen_task_datetime(){
		var datetime;
		var current_time;
		
		timer = setInterval(function(){
					
		for(var i=0;i<task_list.length;i++){
			
			var $item = task_list[i];
			if(!$item || !$item.date || $item.know) continue;	
			current_time = (new Date).getTime();
			
			datetime = (new Date($item.date)).getTime();
			
			if(current_time - datetime >= 1){
				show_remind(i);
				listen_know_action(i);
			}
		}

	},300);

	}
	// 监听‘知道了’按钮
	function listen_know_action(index){
		$remind_know.on('click',function(){
			hide_remind();
			update_task(index,{know:true});
		})
	}

	// 显示提醒信息
	function show_remind(index){
		$remind.show(index);
		$remind_content.html(task_list[index].content);
	}
	// 隐藏提醒信息
	function hide_remind(){
		$remind.hide();
		
	}
	// 更新任务详情
	function update_task_detail(index){
		$update_detail.on('click',function(e){
			e.preventDefault();
			var data = {};

			data.title = $detail_title.val();
			data.desc = $detail_desc.val();
			data.date = $detail_date.val();

			update_task(index,data);
			
			hide_task_detail();		
		})	
	}

	// 监听隐藏任务详情
	function listen_hide_task_detail(){
		$task_detail_mask.on('click',function(){
			hide_task_detail();
		})
	}

	// 监听完成任务
	function listen_task_complete(){
		$checkbox.on('click',function(){
		var $this = $(this);
		var index = $this.parent().data('index');
		
		var item = get(index);
		

		if(item.complete){
			update_task(index,{complete:false});
		}else{
			update_task(index,{complete:true});
		}	
	})
	}

	function get(index){
		return store.get('task_list')[index];
	}

	// 更新任务信息
	function update_task(index,data){
		if(!index || !task_list[index] || !data) return;
		task_list[index] = $.extend({},task_list[index],data);
		refresh_task_list();
	}

	// 监听删除操作
	function listen_task_delete(){
		$delete_task.on('click',function(){
		var $this = $(this);
		var $item = $this.parent().parent();

		var index = $item.data('index');
		pop('确定要删除吗？')
		.then(function(result){
			result? delete_task(index):null;
		})
		
		
	})

	}
	// 删除任务
	function delete_task(index){
		delete task_list[index];
		refresh_task_list();
	}

	// 初始化
	function init(){
		task_list = store.get('task_list') || [];
		listen_task_datetime();
		if(task_list.length!==0){
			render_task_list();
			
		}

	}
	// 监听添加任务
	$add_task.on('click',function(e){
		var new_task = {};
		e.preventDefault();
		new_task.content = $new_task.val();
		if(!new_task.content)  return;

		add_task(new_task);
		$new_task.val("");

	})
	// 添加任务
	function add_task(new_task){
		task_list.push(new_task);		
		refresh_task_list();
	}
	// 刷新任务列表
	function refresh_task_list(){
		store.set('task_list',task_list);
		// console.log(store.get('task_list'));
		render_task_list();
	}
	// 渲染任务列表
	function render_task_list(){

		$task_list.html("");
		
			var completed_list = [];
		for(var i=0;i<task_list.length;i++){
			
			var item = task_list[i];		
			
			if(item && item.complete){
				completed_list[i] = item;	
			}else{
				var $item= render_task_list_item(item,i);
				$task_list.prepend($item);
			}		
		}
		for(var j=0;j<completed_list.length;j++){
			var $item = render_task_list_item(completed_list[j],j);
			if(!$item) continue;
			$item.addClass('complete');
			
			$task_list.append($item);
		}

		$task_list_item = $('.task-list-item');
		$delete_task = $('.task-list-item .delete');
		$detail_task = $('.task-list-item .detail');
		$checkbox = $('.task-list-item input');
		listen_task_delete();
		listen_task_complete();
		listen_task_detail();
			
	}


	// 单个任务模板
	function render_task_list_item(item,index){
		if(!item) return ;
		var tpl = '<div class="task-list-item" data-index="'+index+'">'+
				'<input type="checkbox" '+(item.complete? "checked":"")+'>'+
				'<span>'+item.content+'</span>'+
				'<span class="action">'+
				'<span class="delete">删除</span>'+
				'<span class="detail">详细</span>'+
				'</span>'+
				'</div>';
		return $(tpl);
	}

})();