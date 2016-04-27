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

use yii\helpers\ArrayHelper;

/**
 * Class for Static combo.
 *
 * @property mixed data
 */
class StaticCombo extends Combo
{
    public $name = 'default';

    public $type = 'default';

    public $_data = [];

    public function getPluginOptions($options = [])
    {
        $options = parent::getPluginOptions();
        unset($options['select2Options']['ajax']);

        return ArrayHelper::merge($options, [
            'select2Options' => [
                'data' => $this->data,
            ],
        ]);
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->_data;
    }

    /**
     * @param array $data
     */
    public function setData($data)
    {
        $res  = [];
        $data = (array) $data;

        foreach ($data as $key => $value) {
            if ($value instanceof \Closure) {
                $res[] = call_user_func($value, $this);
            } elseif (!is_array($value)) {
                $res[] = ['id' => $key, 'text' => $value];
            }
        }
        $this->_data = $res;
    }
}
