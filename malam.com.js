$(function() {
    var Row = function(){
        var _settings = {
            debug:1,//1-5
            $row:null,
            hours:null
        }
        var _public = {
            getDelta: function (){

            },
            init: function (row){
                _settings.$row = $(row);
                if(_private.isWorkDay() === false) return false;
                return _private.getWorkingHours();
            }
        }

        var _private = {
            isWorkDay:function(){
                return $('select[id$="workTypeSelect"]',_settings.$row).val() === '200_0' ? true : false;
            },
            getWorkingHours:function(){
                var _bruttoHours = _private.str2time(_private.getCellHtml('hourTotalLabel')),
                    _nettoHours = _private.str2time(_private.getCellHtml('netHoursLabel'));
                return{
                    'brutto':_bruttoHours,
                    'netto':_nettoHours
                }
            },
            getCellHtml:function (id){
                return $('span[id$="'+id+'"]',_settings.$row).html();
            },
            str2time: function(dirty){
                if(!dirty) return false;
                var _time = dirty.split(":");
                return parseInt(_time[0])*60*60 + parseInt(_time[1])*60
            }
        }


        var _l = function(level){
            if(level > _settings.debug) return;
            console.log.apply(console,Array.prototype.slice.call(arguments,1));
        }

        for(var method in _private)(function(method){
            if (!_private.hasOwnProperty(method)) return;


            wrap(_private,method,function(original){
                var _args = Array.prototype.slice.call(arguments,1);
                _l(5,'Row :: auto :: ' + method, _args);
                try{
                    return original.apply(original,_args);
                }catch (e){
                    console.error('Method :: ' + method + ' :: failed with error: ',e);
                }
            });

        })(method);

        function wrap(object, method, wrapper){
            var fn = object[method];
            return object[method] = function(){
                return wrapper.apply(this, [fn.bind(this)].concat(
                    Array.prototype.slice.call(arguments)
                ));
            }
        }

        return _public;
    }

    var _$rows = $('#dataTable table tr');
    var _totalBrutto = 0,_totalNetto = 0, _workDays = 0;

    _$rows.each(function(k,row){
        if(k < 5) return;
        var _rowHours = (new Row()).init(row);
        if(_rowHours === false) return;
        if(!_rowHours.brutto || !_rowHours.netto) return;
        $(row).addClass('working');
        _totalBrutto += _rowHours.brutto;
        _totalNetto += _rowHours.netto;
        _workDays++;
    });
    var _expectedBrutto = _workDays*9*60*60,_expectedNetto =_workDays*8*60*60;
    var _deltaBrutto = parseTime(_totalBrutto - _expectedBrutto), _deltaNetto =parseTime(_totalNetto - _expectedNetto);

$('title').html(
    [
        'w:' + _workDays,
        'n:' + _deltaNetto.p + _deltaNetto.h + ":" + _deltaNetto.m,
        'b:' + _deltaBrutto.p + _deltaBrutto.h + ":" + _deltaBrutto.m
    ].join(' :: ')
);

//    console.log(_workDays,
//        parseTime(_expectedBrutto),
//        parseTime(_totalBrutto),
//        parseTime(_deltaBrutto),
//        parseTime(_expectedNetto),
//        parseTime(_totalNetto),
//        parseTime(_deltaNetto)
//    );
    function parseTime(seconds){
        var _prefix = seconds < 0 ? '-' : '+';
        seconds = seconds < 0 ? seconds * -1 : seconds;
        var _h = Math.floor(seconds/60/60),
            _m = Math.floor((seconds - _h * 60 * 60)/60),
            _s = Math.floor((seconds - _h * 60 * 60) - _m * 60);
        return{
            h:_h,m:_m,s:_s,p:_prefix
        }
    }
});
