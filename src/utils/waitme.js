/*
waitMe - 1.19 [31.10.17]
Author: vadimsva
Github: https://github.com/vadimsva/waitMe
*/

// 由于eslint不支持es6，因此将次内容直接内置到wwjs,更好的做法，是做一个es6桥接模块，以方便未来block采用动态加载时确定执行库。
/* eslint-disable */
import './waitme.css'
import img from './img.svg'
import EE from './evt'
import cfg from './cfg'

// console.log(console)
// console.log(console.log(img))
let imgurl
function getDefImgURL(){
  if(!imgurl){
    imgurl = `${wwjs.ui.baseurl()}img`
  }
  console.log(imgurl)
  return imgurl
}

(function ($) {
  $.fn.waitMe = function (method) {
    return this.each(function () {
      var elem = $(this)

      var elemClass = 'waitMe'

      var waitMe_text

      var effectObj

      var effectElemCount

      var createSubElem = false

      var specificAttr = 'background-color'

      var addStyle = ''

      var effectElemHTML = ''

      var waitMeObj

      var _options

      var currentID

      var methods = {
        init: function () {
          var _defaults = {
            effect: 'bounce',
            text: '',
            bg: 'rgba(255,255,255,0.7)',
            color: '#000',
            maxSize: '',
            waitTime: -1,
            textPos: 'vertical',
            fontSize: '',
            source: '',
            onClose: function () {}
          }
          _options = $.extend(_defaults, method)

          currentID = new Date().getMilliseconds()
          waitMeObj = $('<div class="' + elemClass + '" data-waitme_id="' + currentID + '"></div>')

          switch (_options.effect) {
            case 'none':
              effectElemCount = 0
              break
            case 'bounce':
              effectElemCount = 3
              break
            case 'rotateplane':
              effectElemCount = 1
              break
            case 'stretch':
              effectElemCount = 5
              break
            case 'orbit':
              effectElemCount = 2
              createSubElem = true
              break
            case 'roundBounce':
              effectElemCount = 12
              break
            case 'win8':
              effectElemCount = 5
              createSubElem = true
              break
            case 'win8_linear':
              effectElemCount = 5
              createSubElem = true
              break
            case 'ios':
              effectElemCount = 12
              break
            case 'facebook':
              effectElemCount = 3
              break
            case 'rotation':
              effectElemCount = 1
              specificAttr = 'border-color'
              break
            case 'timer':
              effectElemCount = 2
              if ($.isArray(_options.color)) {
                var color = _options.color[0]
              } else {
                var color = _options.color
              }
              addStyle = 'border-color:' + color
              break
            case 'pulse':
              effectElemCount = 1
              specificAttr = 'border-color'
              break
            case 'progressBar':
              effectElemCount = 1
              break
            case 'bouncePulse':
              effectElemCount = 3
              break
            case 'img':
              effectElemCount = 1
              break
          }

          if (addStyle !== '') {
            addStyle += ';'
          }

          if (effectElemCount > 0) {
            if (_options.effect === 'img') {
              effectElemHTML = '<img src="' + (_options.source || getDefImgURL()) + '">'
            } else {
              for (var i = 1; i <= effectElemCount; ++i) {
                if ($.isArray(_options.color)) {
                  var color = _options.color[i]
                  if (color == undefined) {
                    color = '#000'
                  }
                } else {
                  var color = _options.color
                }
                if (createSubElem) {
                  effectElemHTML += '<div class="' + elemClass + '_progress_elem' + i + '"><div style="' + specificAttr + ':' + color + '"></div></div>'
                } else {
                  effectElemHTML += '<div class="' + elemClass + '_progress_elem' + i + '" style="' + specificAttr + ':' + color + '"></div>'
                }
              }
            }
            effectObj = $('<div class="' + elemClass + '_progress ' + _options.effect + '" style="' + addStyle + '">' + effectElemHTML + '</div>')
          }

          if (_options.text) {
            if ($.isArray(_options.color)) {
              var color = _options.color[0]
            } else {
              var color = _options.color
            }
            if (_options.fontSize != '') {
              var size = 'font-size:' + _options.fontSize
            } else {
              var size = ''
            }
            waitMe_text = $('<div class="' + elemClass + '_text" style="color:' + color + ';' + size + '">' + _options.text + '</div>')
          }
          var elemObj = elem.find('> .' + elemClass)

          if (elemObj) {
            elemObj.remove()
          }
          var waitMeDivObj = $('<div class="' + elemClass + '_content ' + _options.textPos + '"></div>')
          waitMeDivObj.append(effectObj, waitMe_text)
          waitMeObj.append(waitMeDivObj)
          if (elem[0].tagName == 'HTML') {
            elem = $('body')
          }
          elem.addClass(elemClass + '_container').attr('data-waitme_id', currentID).append(waitMeObj)
          elemObj = elem.find('> .' + elemClass)
          var elemContentObj = elem.find('.' + elemClass + '_content')
          elemObj.css({ background: _options.bg })

          if (_options.maxSize !== '' && _options.effect != 'none') {
            var elemH = effectObj.outerHeight()
            var elemW = effectObj.outerWidth()
            var elemMax = elemH
            if (_options.effect === 'img') {
              effectObj.css({ height: _options.maxSize + 'px' })
              effectObj.find('>img').css({ maxHeight: '100%' })
              elemContentObj.css({ marginTop: -elemContentObj.outerHeight() / 2 + 'px' })
            } else {
              if (_options.maxSize < elemMax) {
                if (_options.effect == 'stretch') {
                  effectObj.css({ height: _options.maxSize + 'px', width: _options.maxSize + 'px' })
                  effectObj.find('> div').css({ margin: '0 5%' })
                } else {
                  var zoom = _options.maxSize / elemMax - 0.2
                  var offset = '-50%'
                  if (_options.effect == 'roundBounce') {
                    offset = '-75%'
                    if (_options.text) {
                      offset = '75%'
                    }
                  } else if (_options.effect == 'win8' || _options.effect == 'timer' || _options.effect == 'orbit') {
                    offset = '-20%'
                    if (_options.text) {
                      offset = '20%'
                    }
                  } else if (_options.effect == 'ios') {
                    offset = '-15%'
                    if (_options.text) {
                      offset = '15%'
                    }
                  }
                  if (_options.effect == 'rotation') {
                    if (_options.text) {
                      offset = '75%'
                    }
                  }
                  effectObj.css({ transform: 'scale(' + zoom + ') translateX(' + offset + ')', whiteSpace: 'nowrap' })
                }
              }
            }
          }
          elemContentObj.css({ marginTop: -elemContentObj.outerHeight() / 2 + 'px' })

          function setElTop (getTop) {
            elemContentObj.css({ top: 'auto', transform: 'translateY(' + getTop + 'px) translateZ(0)' })
          }
          if (elem.outerHeight() > $(window).height()) {
            var sTop = $(window).scrollTop()

            var elH = elemContentObj.outerHeight()

            var elTop = elem.offset().top

            var cH = elem.outerHeight()

            var getTop = sTop - elTop + $(window).height() / 2
            if (getTop < 0) {
              getTop = Math.abs(getTop)
            }
            if (getTop - elH >= 0 && getTop + elH <= cH) {
              if (elTop - sTop > $(window).height() / 2) {
                getTop = elH
              }
              setElTop(getTop)
            } else {
              if (sTop > elTop + cH - elH) {
                getTop = sTop - elTop - elH
              } else {
                getTop = sTop - elTop + elH
              }
              setElTop(getTop)
            }
            $(document).scroll(function () {
              var sTop = $(window).scrollTop()

              var getTop = sTop - elTop + $(window).height() / 2
              if (getTop - elH >= 0 && getTop + elH <= cH) {
                setElTop(getTop)
              }
            })
          }

          if (_options.waitTime > 0) {
            setTimeout(function () {
              waitMeClose()
            }, _options.waitTime)
          }

          elemObj.on('destroyed', function () {
            if (_options.onClose && $.isFunction(_options.onClose)) {
              _options.onClose(elem)
            }
            elemObj.trigger('close', { el: elem })
          })

          $.event.special.destroyed = {
            remove: function (o) {
              if (o.handler) {
                o.handler()
              }
            }
          }

          return elemObj
        },
        hide: function () {
          waitMeClose()
        }
      }

      function waitMeClose () {
        var currentID = elem.attr('data-waitme_id')
        elem.removeClass(elemClass + '_container').removeAttr('data-waitme_id')
        elem.find('.' + elemClass + '[data-waitme_id="' + currentID + '"]').remove()
      }

      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
      } else if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments)
      }
    })
  }
  // $(window).on('load', function () {
  //   $('body.waitMe_body').addClass('hideMe')
  //   setTimeout(function () {
  //     $('body.waitMe_body').find('.waitMe_container:not([data-waitme_id])').remove()
  //     $('body.waitMe_body').removeClass('waitMe_body hideMe')
  //   }, 200)
  // })
})(jQuery)

/* eslint-enable */

let indicatorID
function removeIndicator () {
  indicatorID = undefined
  $('body.waitMe_body').addClass('hideMe')
  setTimeout(function () {
    $('body.waitMe_body').find('.waitMe_container:not([data-waitme_id])').remove()
    $('body.waitMe_body').removeClass('waitMe_body hideMe')
  }, 10)
}
EE.on('state:loaded', function (loadedCount) {
  let $body = $('body.waitMe_body')
  if ($body.length > 0) { // 有加载进度指示条。
    if (!indicatorID) {
      indicatorID = setTimeout(removeIndicator, 100)
    }
  }
})

if (cfg.indicator !== false) {
  EE.on('state:loading', function (loadedCount) {
    let $body = $('body')
    if ($body.hasClass('waitMe_body') || $body.hasClass('hideMe')) {
      // already has indicator. 清除当前的移除indicator的缓冲。
      if (indicatorID) {
        clearTimeout(indicatorID)
        indicatorID = undefined
      }
    } else {
      let bgcolor = '#fff0'
      let style = 'working'
      let color = '#000'
      let text = ''
      let imgurl = ''
      if (typeof cfg.indicator === 'object') {
        bgcolor = cfg.indicator.bgcolor || bgcolor
        style = cfg.indicator.style || style
        color = cfg.indicator.color || color
        text = cfg.indicator.text || text
        imgurl = cfg.indicator.imgurl || imgurl
      } else if (typeof cfg.indicator === 'string') {
        bgcolor = cfg.indicator
      }
      if (style === 'img' && !imgurl) {
        imgurl = getDefImgURL()
      }
      if (style === 'text' && !text) {
        text = wwjs.i18n('加载中...')
      }
      $body.addClass('waitMe_body')
      $body.prepend(`<div class="waitMe_container ${style}" style="background:${bgcolor}">
      <div style="${(style === 'text') ? 'color' : 'background'}:${(style === 'img') ? `url('${imgurl}')` : color}">${text}</div>
      </div>`)
    }
  })
}
