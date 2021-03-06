<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 21/03/18
 * Time: 23:02
 */

namespace App\Form;

use App\DTO\ResourceVersionDTO;
use App\Form\DataTransformer\HImageTransformer;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class HFileUploadType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->setMethod('POST');

        $builder
            ->add('file', FileType::class, array(
                'required' => true
            ))
            ->add('name', TextType::class, array(
                'required' => true
            ));
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => ResourceVersionDTO::class,
            'allow_extra_fields' => true,
            'csrf_protection' => false
        ));
    }
}