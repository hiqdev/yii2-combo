<?php

/*
 * Combo widget for Yii2
 *
 * @link      https://github.com/hiqdev/yii2-combo
 * @package   yii2-combo
 * @license   BSD-3-Clause
 * @copyright Copyright (c) 2015-2016, HiQDev (http://hiqdev.com/)
 */

namespace hiqdev\combo;

use Yii;
use yii\base\Model;
use yii\base\Widget;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\JsExpression;
use yii\web\View;

/**
 * Widget Combo.
 *
 * @property mixed $return see [[_return]]
 * @property mixed $rename see [[_rename]]
 * @property mixed $filter see [[_filter]]
 * @property mixed $pluginOptions see [[_pluginOptions]]
 * @property mixed $primaryFilter see [[_primaryFilter]]
 * @property mixed hasId
 */
class Combo extends Widget
{
    /**
     * @var Model
     */
    public $model;

    /**
     * @var string the attribute name
     */
    public $attribute;

    /**
     * @var array the url that will be passed to [[Url::to()]] method to create the request URL
     */
    public $url;

    /**
     * @var string the type of the field.
     * Usual should be module/comboName.
     * For example: client/client, hosting/account, domain/domain.
     * In case of the combo overriding with some specific filters,
     * the type should represent the filter.
     * For example: if the hosting/service combo is extended with filter
     * to show only DB services, the type should be hosting/service/db or hosting/dbService.
     * The decision of the style depends on overall code style and readability
     */
    public $type;

    /**
     * @var string the name of the representative field in the model.
     * Used by [[getPrimaryFilter]] to create the name of the filtering field
     * @see getPrimaryFilter()
     */
    public $name;

    /**
     * @var string md5 of the configuration.
     * Appears only after the combo registration in [[register]]
     * @see register()
     */
    public $configId;

    /**
     * @var array the HTML options for the input element
     */
    public $inputOptions = [];

    /**
     * @var string the outer element selector, that holds all of related Combos
     */
    public $formElementSelector = 'form';

    /**
     * @var string the language. Default is application language
     */
    public $language;

    /**
     * @var bool allow multiple selection
     */
    public $multiple;

    /**
     * @var array
     */
    public $current;

    /**
     * @var mixed returning arguments
     * Example:
     *
     * ```
     *  ['id', 'password', 'another_column']
     * ```
     *
     * @see getReturn()
     * @see setReturn()
     */
    protected $_return;

    /**
     * @var array renamed arguments
     * Example:
     *
     * ```
     *  [
     *      'new_col_name' => 'old_col_name',
     *      'text' => 'login',
     *      'deep' => 'array.subarray.value' // can extract some value from an array
     *  ]
     * ```
     *
     * @see getName()
     * @see setName()
     */
    protected $_rename;

    /**
     * @var array the static filters
     * Example:
     *
     * ```
     * [
     *      'someStaticValue' => ['format' => 'the_value'],
     *      'type'            => ['format' => 'seller'],
     *      'is_active'       => [
     *          'field'  => 'server',
     *          'format' => new JsExpression('function (id, text, field) {
     *              if (field.isSet()) {
     *                  return 1;
     *              }
     *          }'),
     *      ]
     * ]
     * @see setFilter()
     * @see getFilter()
     */
    protected $_filter = [];

    /**
     * @var string the name of the primary filter. Default: [[name]]_like
     * @see getPrimaryFilter
     * @see setPrimaryFilter
     */
    protected $_primaryFilter;

    /**
     * @var boolean|string whether the combo has a primary key
     *   null (default) - decision will be taken automatically.
     *                    In case when [[attribute]] has the `_id` postfix, this property will be treated as `true`
     *            false - the combo does not have an id. Meaning the value of the attribute will be used as the ID
     *           string - the explicit name of the ID attribute
     */
    public $_hasId;

    /**
     * Options that will be passed to the plugin.
     *
     * @var array
     * @see getPluginOptions()
     */
    public $_pluginOptions = [];

    /** {@inheritdoc} */
    public function init()
    {
        parent::init();

        // Set language
        if ($this->language === null && ($language = Yii::$app->language) !== 'en-US') {
            $this->language = substr($language, 0, 2);
        }
        if (!$this->_return) {
            $this->return = ['id'];
        }
        if (!$this->rename) {
            $this->rename = ['text' => $this->name];
        }
        if (!$this->inputOptions['id']) {
            $this->inputOptions['id'] = Html::getInputId($this->model, $this->attribute);
        }
        if ($this->multiple) {
            $this->inputOptions['multiple'] = true;
        }
        if ($this->inputOptions['readonly']) {
            $this->inputOptions['disabled'] = true;
        }
        if (!$this->inputOptions['data-combo-field']) {
            $this->inputOptions['data-combo-field'] = $this->name;
        }
        if (!isset($this->inputOptions['unselect'])) {
            $this->inputOptions['unselect'] = null;
        }
    }

    public function run()
    {
        $this->registerClientConfig();
        $this->registerClientScript();
        return $this->renderInput();
    }

    /**
     * Renders text input that will be used by the plugin.
     * Must apply [[inputOptions]] to the HTML element.
     *
     * @return string
     */
    protected function renderInput()
    {
        $html = [];
        if ($this->inputOptions['readonly']) {
            $html[] = Html::activeHiddenInput($this->model, $this->attribute, [
                'id' => $this->inputOptions['id'] . '-hidden',
            ]);
        }
        $html[] = Html::activeDropDownList($this->model, $this->attribute, $this->getCurrentOptions(), $this->inputOptions);

        return implode('', $html);
    }

    public function registerClientConfig()
    {
        $view = $this->view;
        ComboAsset::register($view);

        $pluginOptions = Json::encode($this->pluginOptions);
        $this->configId = md5($this->type . $pluginOptions);
        $view->registerJs("$.comboConfig().add('{$this->configId}', $pluginOptions);", View::POS_READY, 'combo_' . $this->configId);
    }

    public function registerClientScript()
    {
        $selector = $this->inputOptions['id'];
        $js = "$('#$selector').closest('{$this->formElementSelector}').combo().register('#$selector', '$this->configId');";

        $this->view->registerJs($js);
    }

    public function getReturn()
    {
        return $this->_return;
    }

    /**
     * @return mixed
     */
    public function getRename()
    {
        return $this->_rename;
    }

    /**
     * @return mixed
     */
    public function getFilter()
    {
        return $this->_filter;
    }

    /**
     * @param mixed $filter
     */
    public function setFilter($filter)
    {
        $this->_filter = $filter;
    }

    /**
     * @param mixed $rename
     */
    public function setRename($rename)
    {
        $this->_rename = $rename;
    }

    /**
     * @param mixed $return
     */
    public function setReturn($return)
    {
        $this->_return = $return;
    }

    /**
     * @return string
     * @see _primaryFilter
     */
    public function getPrimaryFilter()
    {
        return $this->_primaryFilter ?: $this->name . '_like';
    }

    /**
     * @param $primaryFilter
     * @see _primaryFilter
     */
    public function setPrimaryFilter($primaryFilter)
    {
        $this->_primaryFilter = $primaryFilter;
    }

    /**
     * Returns the config of the Combo, merges with the passed $config.
     *
     * @param array $options
     * @return array
     */
    public function getPluginOptions($options = [])
    {
        $defaultOptions = [
            'name' => $this->name,
            'type' => $this->type,
            'hasId' => $this->hasId,
            'select2Options' => [
                'width'       => '100%',
                'placeholder' => '----------',
                'minimumInputLength' => '0',
                'ajax'        => [
                    'url'    => Url::toRoute($this->url),
                    'type'   => 'post',
                    'return' => $this->return,
                    'rename' => $this->rename,
                    'filter' => $this->filter,
                    'data' => new JsExpression("
                        function (event) {
                            return $(this).data('field').createFilter($.extend(true, {
                                '{$this->primaryFilter}': {format: event.term}
                            }, event.filters || {}));
                        }
                    "),
                ],
            ],
        ];

        return ArrayHelper::merge($defaultOptions, $this->_pluginOptions, $options);
    }

    public function getFormIsBulk()
    {
        return preg_match("/^\[.*\].+$/", $this->attribute);
    }

    /**
     * @param array $pluginOptions
     */
    public function setPluginOptions($pluginOptions)
    {
        $this->_pluginOptions = $pluginOptions;
    }

    /**
     * @return bool|string
     */
    public function getHasId()
    {
        return $this->_hasId === null ? (substr($this->attribute, -3) === '_id') : $this->_hasId;
    }

    /**
     * @param bool|string $hasId
     */
    public function setHasId($hasId)
    {
        $this->_hasId = $hasId;
    }

    protected function getCurrentOptions()
    {
        $value = Html::getAttributeValue($this->model, $this->attribute);

        if (!isset($value)) {
            return [];
        }

        if (!empty($this->current)) {
            return $this->current;
        }

        if ($this->getHasId()) {
            if (!is_scalar($value)) {
                Yii::error('When Combo has ID, property $current must be set manually, or attribute value must be a scalar. Value ' . var_export($value, true) . ' is not a scalar.', __METHOD__);
                return [];
            }

            return [$value => $value];
        } else {
            if (is_array($value)) {
                return array_combine(array_values($value), array_values($value));
            }

            return [$value => $value];
        }
    }
}
