let _$scope = new WeakMap()
let _Messages = new WeakMap()
let _transFilter = new WeakMap()
let _$q = new WeakMap()

export default class BannerController {

  constructor(blogService, $scope, Messages, transFilter, $q) {

    _$scope.set(this, $scope)
    _Messages.set(this, Messages)
    _transFilter.set(this, transFilter)
    _$q.set(this, $q)

    // Variables exposed in view
    this.blog = blogService
    this.accordionIsOpen = false
    this.repeatX = false
    this.repeatY = false
    this.position = '0-0'
    this.backgroundImageUrl = `url('${this.blog.banner_dir}/${this.blog.options.banner_background_image}')`

    this.bannerPositions = [
      [{ text: 'top left', class : 'xtop yleft' }, { text: 'top center', class : 'xtop ycenter' }, { text: 'top right', class : 'xtop yright' }],
      [{ text: 'center left', class : 'xcenter yleft' }, { text: 'center center', class : 'xcenter ycenter' }, { text: 'center right', class : 'xcenter yright' }],
      [{ text: 'bottom left', class : 'xbottom yleft' }, { text: 'bottom center', class : 'xvottom ycenter' }, { text: 'bottom right', class : 'xbottom yright' }]
    ]
    this.oldBannerOptions = {}
    this.fileToUpload = null
    this.removeBanner = false

    this.init()

  }

  init() {
    // Save a clean copy of banner options
    this.oldBannerOptions = {
      height: this.blog.options.banner_height,
      backgroundColor: this.blog.options.banner_background_color,
      backgroundImage: this.blog.options.banner_background_image,
      backgroundPosition: this.blog.options.banner_background_image_position,
      backgroundRepeat: this.blog.options.banner_background_image_repeat
    }

    _$scope.get(this).$watch(() => this.blog.options.banner_background_image_position, () => {
      for (let idxX = 0; idxX < this.bannerPositions; idxX++) {
        for (let idxY = 0; idxY < this.bannerPositions[idxX]; idxY++) {
          if (this.bannerPositions[idxX][idxY].text === this.blog.options.banner_background_image_position) {
            this.position = `${idxX}-${idxY}`
          }
        }
      }
    })

    _$scope.get(this).$watch(() => this.blog.options.banner_background_image_repeat, () => {

      switch(this.blog.options.banner_background_image_repeat) {
        case 'repeat-x':
          this.repeatX = true
          this.repeatY = false
          break
        case 'repeat-y':
          this.repeatX = false
          this.repeatY = true
          break
        case 'repeat':
          this.repeatX = this.repeatY = true
          break
        case 'no-repeat':
        default:
          this.repeatX = this.repeatY = false
          break
      }
    })

  }

  getBannerStyle() {
    return {
      'height': this.blog.options.banner_height,
      'background-color': this.blog.options.banner_background_color,
      'background-image': `url('${this.blog.img_dir}${this.blog.options.banner_background_image}')`,
      'background-position': this.blog.options.banner_background_image_position,
      'background-repeat': this.blog.options.banner_background_image_repeat
    }
  }

  setPosition(position) {
    this.position = position
    let indexes = this.position.split("-")
    this.blog.options.banner_background_image_position = this.bannerPositions[indexes[0]][indexes[1]].text
  }

  setRepetition() {
    let repetition = 'no-repeat'
    if (this.repeatX) {
      repetition = 'repeat-x'
    }
    if (this.repeatY) {
      repetition = 'repeat-y'
    }
    if (this.repeatX && this.repeatY) {
      repetition = 'repeat'
    }
    this.blog.options.banner_background_image_repeat = repetition
  }

  getSelectedClass(x, y) {

    let indexes = this.position.split("-")

    return `${x}-${y}` === this.position
           || (this.repeatX && x.toString() === indexes[0])
           || (this.repeatY && y.toString() === indexes[1])
           || (this.repeatX && this.repeatY)
      ? 'selected'
      : ''
  }

  bannerReinit() {
    this.blog.options.banner_background_image = null
    this.backgroundImageUrl = null
    this.blog.options.banner_background_image_position = 'left top'
    this.blog.options.banner_background_image_repetition = 'no-repeat'
    this.removeBanner = true
  }

  preview(file) {
    this.fileToUpload = file

    let reader = new FileReader();
    reader.onload = e => {
      this.backgroundImageUrl = `url(${e.target.result})`
    }
    reader.readAsDataURL(file);
  }

  cancelBannerEdition() {

    this.blog.options.banner_height                    = this.oldBannerOptions['height']
    this.blog.options.banner_background_color          = this.oldBannerOptions['backgroundColor']
    this.blog.options.banner_background_image          = this.oldBannerOptions['backgroundImage']
    this.blog.options.banner_background_image_position = this.oldBannerOptions['backgroundPosition']
    this.blog.options.banner_background_image_repeat   = this.oldBannerOptions['backgroundRepeat']
    this.backgroundImageUrl = `url('${this.blog.banner_dir}/${this.blog.options.banner_background_image}')`

    this.accordionIsOpen = false

  }

  saveBannerEdition() {

    // Banner options are stored in blog options, a copy is used before saving through the API
    this.blog.optionsCopy = angular.copy(this.blog.options)
    
    if (this.removeBanner) {
      this.blog.removeBanner()
        .then(
          () => {
            this._setMessage('success', 'icap_blog_post_configure_banner_success')
            this.removeBanner = false
            this.accordionIsOpen = false
          },
          () => {
            this._setMessage('danger', 'icap_blog_post_configure_banner_error')
          }
        )
    } else {
      _$q.get(this).all([this.blog.uploadBanner(this.fileToUpload), this.blog.editOptions()])

        .then(
          success => {
            this._setMessage('success', 'icap_blog_post_configure_banner_success')
            this.accordionIsOpen = false
            this.fileToUpload = null
          },
          () => {
            this._setMessage('danger', 'icap_blog_post_configure_banner_error')
          }
        )
    }
    
    
  }

  _setMessage(type, msg, params = {}, filter = false, realm = 'icap_blog', keep = false) {
    _Messages.get(this).push({
      type: type,
      msg: _transFilter.get(this)(msg, params, realm),
      filter: filter,
      keep: keep
    })
  }

}

BannerController.$inject = [
  'blogService',
  '$scope',
  'Messages',
  'transFilter',
  '$q'
]