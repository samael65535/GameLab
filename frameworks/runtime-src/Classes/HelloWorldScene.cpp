#include "HelloWorldScene.h"
#include "CCSpriteWithHue.h"

USING_NS_CC;

Scene* HelloWorld::createScene()
{
    // 'scene' is an autorelease object
    auto scene = Scene::create();
    
    // 'layer' is an autorelease object
    auto layer = HelloWorld::create();

    // add layer as a child to scene
    scene->addChild(layer);

    // return the scene
    return scene;
}

// on "init" you need to initialize your instance
bool HelloWorld::init()
{
    //////////////////////////////
    // 1. super init first
    if ( !Layer::init() )
    {
        return false;
    }
    
    Size visibleSize = Director::getInstance()->getVisibleSize();
    Vec2 origin = Director::getInstance()->getVisibleOrigin();

 
    // add "HelloWorld" splash screen"
    auto sprite = Sprite::create("HelloWorld.png");

    // position the sprite on the center of the screen
    sprite->setPosition(Vec2(visibleSize.width/2 + origin.x, visibleSize.height/2 + origin.y));

    // add the sprite as a child to this layer
    this->addChild(sprite, 0);
    
    
    if(true)//SpriteWithHue
    {
//        for(int i=0; i<30; i++)
        {
            auto alien = SpriteWithHue::create("res/alien.png");
            alien->setPosition(Vec2((visibleSize.width + origin.x) * CCRANDOM_0_1(), (visibleSize.height + origin.y) * CCRANDOM_0_1()));
            alien->setHue(2 * M_PI * 0.5);
            this->addChild(alien,1);
        }
    }
    else//SpriteWithHue Animation
    {
        for (int i=0; i<30; i++) {
            SpriteFrameCache::getInstance()->addSpriteFramesWithFile("grossini-aliases.plist", "grossini-aliases.png");
            Vector<SpriteFrame*> animFrames(15);
            char str[100] = {0};
            for(int i = 1; i < 15; i++)
            {
                sprintf(str, "dance_%02d", i);
                auto frame = SpriteFrameCache::getInstance()->getSpriteFrameByName(str);
                animFrames.pushBack(frame);
            }
            auto animation = Animation::createWithSpriteFrames(animFrames, 0.3f);
            auto _grossini = SpriteWithHue::createWithSpriteFrameName("grossini_dance_01.png");
            _grossini->setHue(2 * M_PI * CCRANDOM_0_1());
            _grossini->setPosition(Vec2((visibleSize.width + origin.x) * CCRANDOM_0_1(), (visibleSize.height + origin.y) * CCRANDOM_0_1()));
            _grossini->runAction(RepeatForever::create(Animate::create(animation)));
            this->addChild(_grossini,1);
        }
    }
    return true;
}


void HelloWorld::menuCloseCallback(Ref* pSender)
{
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WP8) || (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
	MessageBox("You pressed the close button. Windows Store Apps do not implement a close button.","Alert");
    return;
#endif

    Director::getInstance()->end();

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    exit(0);
#endif
}
